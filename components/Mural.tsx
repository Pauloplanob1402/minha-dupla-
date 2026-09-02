'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAnonAuth } from '@/lib/supabase/useAnonAuth'
import type { Intention } from '@/lib/types'

const CHOICE_EMOJI: Record<string, string> = {
  jogar: '🎮',
  estudar: '📚',
  projeto: '💡',
  silencio: '🤫',
}

function timeAgo(iso: string) {
  const diffMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `há ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `há ${diffDays}d`
}

// Só considera "ao vivo" pedidos postados nas últimas 2 horas — sem isso,
// um post de teste feito ontem continuaria aparecendo pra sempre no mural.
const MURAL_FRESHNESS_HOURS = 2

export default function Mural() {
  const { userId } = useAnonAuth()
  const router = useRouter()
  const [items, setItems] = useState<Intention[]>([])
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [connectedId, setConnectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [formChoice, setFormChoice] = useState<'jogar' | 'estudar' | 'projeto' | 'silencio'>('jogar')
  const [formMessage, setFormMessage] = useState('')
  const [formName, setFormName] = useState('')
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const blockedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    async function load() {
      const freshSince = new Date(Date.now() - MURAL_FRESHNESS_HOURS * 60 * 60 * 1000).toISOString()

      // Busca quem esse usuário já bloqueou, pra nunca mostrar os pedidos
      // dessas pessoas no mural.
      const { data: blockData } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', userId)
      const blockedSet = new Set((blockData ?? []).map((b) => b.blocked_id))
      blockedIdsRef.current = blockedSet

      const { data, error } = await supabase
        .from('intentions')
        .select('*')
        .eq('status', 'open')
        .gte('created_at', freshSince)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Erro ao carregar mural:', error.message)
        return
      }
      if (data) {
        setItems((data as Intention[]).filter((i) => !blockedSet.has(i.user_id)).slice(0, 10))
      }
    }

    load()

    // Realtime: qualquer novo pedido criado por qualquer usuário aparece
    // na hora pra todo mundo que estiver com a página aberta.
    const channel = supabase
      .channel('mural-intentions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'intentions' },
        (payload) => {
          const newItem = payload.new as Intention
          if (blockedIdsRef.current.has(newItem.user_id)) return
          setItems((prev) => [newItem, ...prev].slice(0, 10))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'intentions' },
        (payload) => {
          const updated = payload.new as Intention
          if (updated.status !== 'open') {
            setItems((prev) => prev.filter((i) => i.id !== updated.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Remove da tela pedidos que "envelheceram" além do limite de frescor,
  // caso a aba fique aberta por muito tempo sem refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - MURAL_FRESHNESS_HOURS * 60 * 60 * 1000
      setItems((prev) => prev.filter((item) => new Date(item.created_at).getTime() >= cutoff))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  async function toparDupla(intention: Intention) {
    if (!userId || connectingId) return

    const supabase = createClient()

    // Se essa pessoa nunca postou nada e ainda está com o nome padrão,
    // pergunta o nome agora — senão ela aparece como "Visitante" pra
    // sempre na sala e no card de conquista.
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    if (!myProfile?.display_name || myProfile.display_name === 'Visitante') {
      const typedName = window.prompt('Antes de topar, como você quer ser chamado?')
      if (typedName && typedName.trim()) {
        await supabase.from('profiles').update({ display_name: typedName.trim() }).eq('id', userId)
      }
    }

    setConnectingId(intention.id)

    // 1. Marca a intenção como "matched" (some do mural pra quem chegar depois)
    const { error: updateError } = await supabase
      .from('intentions')
      .update({ status: 'matched' })
      .eq('id', intention.id)
      .eq('status', 'open') // evita corrida: só atualiza se ainda estiver aberta

    if (updateError) {
      console.error('Erro ao topar dupla:', updateError.message)
      setConnectingId(null)
      return
    }

    // 2. Cria a sala de conexão (15 min, já com o horário de término calculado no banco)
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        intention_id: intention.id,
        user_a: intention.user_id,
        user_b: userId,
      })
      .select()
      .single()

    if (roomError || !roomData) {
      console.error('Erro ao criar sala:', roomError?.message)
      setConnectingId(null)
      return
    }

    // 3. Credita Vibe Points pros dois lados
    await supabase.rpc('add_vibe_points', {
      p_user_id: userId,
      p_amount: 20,
      p_reason: 'Topou uma dupla no mural',
    })
    await supabase.rpc('add_vibe_points', {
      p_user_id: intention.user_id,
      p_amount: 20,
      p_reason: 'Dupla formada a partir do seu pedido',
    })

    // 4. Se algum dos dois foi indicado por alguém (Modo Cupido) e essa é
    // a primeira dupla dele, credita o bônus em dobro pra quem indicou.
    await supabase.rpc('claim_cupid_bonus', { p_user_id: userId })
    await supabase.rpc('claim_cupid_bonus', { p_user_id: intention.user_id })

    setConnectedId(intention.id)
    setToast('Sala aberta! Te levando pra lá...')
    setTimeout(() => router.push(`/sala/${roomData.id}`), 900)
  }

  async function postIntention(e: FormEvent) {
    e.preventDefault()
    if (!userId || !formMessage.trim() || posting) return
    setPosting(true)

    const supabase = createClient()
    const trimmedName = formName.trim() || 'Visitante'

    const { error } = await supabase.from('intentions').insert({
      user_id: userId,
      choice: formChoice,
      message: formMessage.trim(),
      display_name: trimmedName,
      city: null,
    })

    // Salva o nome no perfil também, não só nesse pedido — é o que faz o
    // nome aparecer certo depois, na sala e no card de conquista, em vez
    // de sempre cair no "Visitante" padrão.
    if (trimmedName !== 'Visitante') {
      await supabase.from('profiles').update({ display_name: trimmedName }).eq('id', userId)
    }

    if (error) {
      console.error('Erro ao postar intenção:', error.message)
    } else {
      setFormMessage('')
      setShowForm(false)
    }
    setPosting(false)
  }

  return (
    <section id="mural" className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-ring" />
          Pedidos ao vivo
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-semibold text-violet hover:text-white transition-colors shrink-0"
        >
          {showForm ? 'Cancelar' : '+ Postar meu pedido'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={postIntention}
          className="flex flex-col sm:flex-row gap-2 mb-4 bg-surface border border-white/10 rounded-xl p-3"
        >
          <select
            value={formChoice}
            onChange={(e) => setFormChoice(e.target.value as typeof formChoice)}
            className="bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white shrink-0"
          >
            <option value="jogar">🎮 Jogar</option>
            <option value="estudar">📚 Estudar</option>
            <option value="projeto">💡 Projeto</option>
            <option value="silencio">🤫 Sala Silenciosa</option>
          </select>
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Seu nome"
            className="bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full sm:w-32 shrink-0"
          />
          <input
            value={formMessage}
            onChange={(e) => setFormMessage(e.target.value)}
            placeholder="O que você quer fazer agora?"
            className="flex-1 bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={!userId || posting || !formMessage.trim()}
            className="cta-gradient text-white text-sm font-semibold rounded-lg px-4 py-2 shrink-0 disabled:opacity-50"
          >
            {posting ? 'Postando...' : 'Postar'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-zinc-500 bg-surface border border-white/10 rounded-xl px-4 py-6 text-center">
            Nenhum pedido aberto agora. Seja o primeiro a postar o que quer fazer hoje.
          </p>
        )}

        {items.map((item) => {
          const isConnecting = connectingId === item.id
          const isConnected = connectedId === item.id
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 bg-surface border rounded-xl px-4 py-3.5 transition-all ${
                isConnected ? 'ring-1 ring-emerald/40 border-white/10' : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 truncate">
                    <span className="text-zinc-300 font-semibold">{item.display_name}</span>
                    {item.city ? ` · ${item.city}` : ''} · {timeAgo(item.created_at)}
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    "{item.message}" {CHOICE_EMOJI[item.choice]}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isConnecting || isConnected || !userId}
                onClick={() => toparDupla(item)}
                className={`shrink-0 text-xs font-semibold rounded-full px-3.5 py-2 transition-colors border ${
                  isConnected
                    ? 'text-emerald border-emerald/40 bg-emerald/10'
                    : 'text-violet border-violet/40 hover:bg-violet/10'
                } ${isConnecting || isConnected ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isConnected ? 'Sala aberta ✅' : isConnecting ? 'Conectando...' : 'Topar Dupla'}
              </button>
            </div>
          )
        })}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-surface border border-emerald/30 text-sm text-white px-5 py-3 rounded-full shadow-2xl shadow-black/50 z-50 flex items-center gap-2">
          <span className="text-emerald">●</span> {toast}
        </div>
      )}
    </section>
  )
}
