'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAnonAuth } from '@/lib/supabase/useAnonAuth'
import AudioCall from '@/components/AudioCall'
import AchievementCard from '@/components/AchievementCard'
import type { Message, Room } from '@/lib/types'

const QUICK_EMOJIS = ['👍', '😂', '🔥', '❤️', '🎉', '👀']
const MAX_FILE_SIZE_MB = 15
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g

function isUrl(str: string) {
  return /^https?:\/\/[^\s]+$/.test(str)
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_SPLIT_REGEX)
  return (
    <>
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function formatCountdown(msLeft: number) {
  if (msLeft <= 0) return '00:00'
  const totalSeconds = Math.floor(msLeft / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function RoomPage() {
  const params = useParams<{ id: string }>()
  const roomId = params.id
  const router = useRouter()
  const { userId, loading: authLoading } = useAnonAuth()

  const [room, setRoom] = useState<Room | null>(null)
  const [otherName, setOtherName] = useState<string | null>(null)
  const [roomChoice, setRoomChoice] = useState<string | null>(null)
  const [notAllowed, setNotAllowed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [now, setNow] = useState(Date.now())
  const bottomRef = useRef<HTMLDivElement>(null)

  // Carrega a sala e confere se o usuário atual faz parte dela
  useEffect(() => {
    if (!userId) return

    async function loadRoom() {
      const supabase = createClient()
      const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single()

      if (error || !data) {
        setNotAllowed(true)
        return
      }
      if (data.user_a !== userId && data.user_b !== userId) {
        setNotAllowed(true)
        return
      }
      setRoom(data as Room)

      const otherId = data.user_a === userId ? data.user_b : data.user_a
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .single()
      setOtherName(otherProfile?.display_name ?? 'sua dupla')

      if (data.intention_id) {
        const { data: intentionData } = await supabase
          .from('intentions')
          .select('choice')
          .eq('id', data.intention_id)
          .single()
        setRoomChoice(intentionData?.choice ?? null)
      }
    }

    loadRoom()
  }, [userId, roomId])

  // Carrega o histórico de mensagens e assina o Realtime
  useEffect(() => {
    if (!room) return
    const supabase = createClient()

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data as Message[])
    }
    loadMessages()

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room, roomId])

  // Relógio do timer de 15 min
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const msLeft = room ? new Date(room.ends_at).getTime() - now : 0
  const isOver = msLeft <= 0
  const countdown = formatCountdown(msLeft)

  // Marca a sala como concluída quando o tempo acaba (best-effort, tanto faz quem faz isso primeiro)
  useEffect(() => {
    if (!room || !isOver || room.status !== 'active') return
    const supabase = createClient()
    supabase.from('rooms').update({ status: 'completed' }).eq('id', room.id).eq('status', 'active')
  }, [isOver, room])

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function sendMessage(content: string, messageType: 'text' | 'image' | 'video' = 'text') {
    if (!userId || !content.trim() || isOver) return
    const supabase = createClient()
    await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content: content.trim(), message_type: messageType })
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo depois
    if (!file || !userId || isOver) return

    setUploadError(null)

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError('Só dá pra enviar imagem ou vídeo.')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`Arquivo muito grande (máximo ${MAX_FILE_SIZE_MB}MB).`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const path = `${roomId}/${crypto.randomUUID()}-${file.name}`

    const { error: uploadErr } = await supabase.storage.from('chat-media').upload(path, file)
    if (uploadErr) {
      setUploadError('Não deu pra enviar o arquivo. Tenta de novo.')
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('chat-media').getPublicUrl(path)
    const messageType = file.type.startsWith('video/') ? 'video' : 'image'
    await sendMessage(publicUrlData.publicUrl, messageType)
    setUploading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    await sendMessage(input)
    setInput('')
    setSending(false)
  }

  const timerColor = useMemo(() => {
    if (isOver) return 'text-zinc-500'
    if (msLeft < 2 * 60 * 1000) return 'text-pink'
    return 'text-emerald'
  }, [msLeft, isOver])

  if (authLoading) return null

  if (notAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-white mb-2">
            Essa sala não é sua
          </h1>
          <p className="text-zinc-400 text-sm mb-6">
            Só quem formou essa dupla pode entrar aqui.
          </p>
          <a href="/" className="cta-gradient inline-flex text-white font-semibold px-6 py-3 rounded-xl">
            Voltar pro DUOS
          </a>
        </div>
      </div>
    )
  }

  if (!room) return null

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-4 sm:px-6">
      <header className="flex items-center justify-between py-5 border-b border-white/5">
        <div>
          <p className="text-xs text-zinc-500">
            {roomChoice === 'silencio' ? 'Sala Silenciosa · só foco' : 'Sala de conexão'}
          </p>
          <h1 className="font-display font-bold text-white">Você e {otherName}</h1>
        </div>
        <div className={`font-display font-extrabold text-2xl tabular-nums ${timerColor}`}>
          {countdown}
        </div>
      </header>

      {!isOver && roomChoice !== 'silencio' && (
        <AudioCall roomId={room.id} endsAt={room.ends_at} leave={isOver} />
      )}

      {!isOver && roomChoice === 'silencio' && (
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-4 py-3 mt-4">
          <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />
          <p className="text-xs sm:text-sm text-zinc-300">
            Modo silencioso — sem áudio. Só presença e foco, o chat abaixo é opcional.
          </p>
        </div>
      )}

      {isOver && (
        <div className="mt-4 bg-surface border border-white/10 rounded-xl px-4 py-3 text-center text-sm text-zinc-300">
          Essa sala já encerrou. Valeu por fazer dupla hoje 💜{' '}
          <a href="/" className="text-violet font-semibold underline">
            Voltar pro mural
          </a>
        </div>
      )}

      {isOver && messages.length > 0 && (
        <AchievementCard otherName={otherName ?? 'sua dupla'} minutes={15} />
      )}

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500 text-center mt-10">
            Ninguém falou nada ainda — manda um "oi" 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.user_id === userId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              {m.message_type === 'image' ? (
                <img
                  src={m.content}
                  alt="Imagem enviada no chat"
                  className="max-w-[75%] rounded-2xl border border-white/10"
                />
              ) : m.message_type === 'video' ? (
                <video
                  src={m.content}
                  controls
                  className="max-w-[75%] rounded-2xl border border-white/10"
                />
              ) : (
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? 'cta-gradient text-white rounded-br-sm'
                      : 'bg-surface2 text-zinc-100 border border-white/10 rounded-bl-sm'
                  }`}
                >
                  <Linkified text={m.content} />
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="pb-5">
        {uploadError && <p className="text-xs text-red-400 mb-2">{uploadError}</p>}
        <div className="flex gap-2 mb-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              disabled={isOver}
              onClick={() => sendMessage(emoji)}
              className="text-lg bg-surface2 border border-white/10 rounded-full w-9 h-9 flex items-center justify-center hover:border-white/30 transition-colors disabled:opacity-40"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <label
            className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-surface2 border border-white/10 cursor-pointer hover:border-white/30 transition-colors ${
              isOver || uploading ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isOver || uploading}
            />
            {uploading ? '⏳' : '📎'}
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isOver}
            placeholder={isOver ? 'Sala encerrada' : 'Escreve algo...'}
            className="flex-1 bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isOver || sending || !input.trim()}
            className="cta-gradient text-white font-semibold text-sm rounded-xl px-5 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
