'use client'

import { useState } from 'react'
import { useAnonAuth } from '@/lib/supabase/useAnonAuth'

export default function CupidMode() {
  const { userId } = useAnonAuth()
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  async function handleInvite() {
    if (!userId) return

    const url = `${window.location.origin}/?convite=${userId}`
    const text =
      'Bora fazer dupla comigo no DUOS? Jogar, estudar ou criar algo junto, sem enrolação:'

    if (navigator.share) {
      try {
        await navigator.share({ title: 'DUOS', text, url })
        setStatus('shared')
        setTimeout(() => setStatus('idle'), 3000)
      } catch {
        // pessoa cancelou o compartilhamento — não faz nada
      }
      return
    }

    await navigator.clipboard.writeText(`${text} ${url}`)
    setStatus('copied')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const buttonLabel =
    status === 'copied' ? 'Link copiado ✅' : status === 'shared' ? 'Convite enviado 🎉' : null

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-10">
      <div className="relative cupid-gradient border border-pink/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 glow-pink rounded-full blur-2xl -z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink/20 text-pink text-xs font-bold uppercase tracking-wider mb-3">
              ✨ Modo Cupido
            </span>
            <h3 className="font-display font-extrabold text-2xl text-white mb-2">
              Ajude 2 amigos a se conectarem e ganhe o dobro.
            </h3>
            <p className="text-sm text-zinc-300">
              Mande um <strong className="text-white">Convite Duplo Secreto</strong> para duas
              pessoas da sua rede. Quando elas toparem o chat de 10 min, os pontos caem direto na
              sua carteira.
            </p>
          </div>

          <button
            type="button"
            onClick={handleInvite}
            disabled={!userId}
            className="w-full sm:w-auto shrink-0 bg-white hover:bg-zinc-100 text-base font-bold text-black px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {buttonLabel ? (
              <span>{buttonLabel}</span>
            ) : (
              <>
                <span className="text-pink">→</span>
                <span>Enviar Convite Secreto</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-surface2 border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
              1
            </span>
            <span>Escolha 2 pessoas da sua rede</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-surface2 border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
              2
            </span>
            <span>Elas recebem o convite secreto</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-surface2 border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
              3
            </span>
            <span>
              Chat aceito = <strong className="text-emerald">pontos em dobro</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
