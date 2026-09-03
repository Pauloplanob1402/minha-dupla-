'use client'

import { useState } from 'react'
import { useLiveCount } from '@/lib/supabase/useLiveCount'
import type { IntentChoice } from '@/lib/types'

const CHOICES: { choice: IntentChoice; label: string; ctaLabel: string; emoji: string; title: string }[] = [
  { choice: 'jogar', label: 'uma partida', ctaLabel: 'uma partida', emoji: '🎮', title: 'Jogar uma partida' },
  { choice: 'estudar', label: 'pra estudar', ctaLabel: 'pra estudar', emoji: '📚', title: 'Estudar / Focar' },
  { choice: 'projeto', label: 'pra criar um projeto', ctaLabel: 'pra criar um projeto', emoji: '💡', title: 'Criar um Projeto' },
  { choice: 'silencio', label: 'em silêncio', ctaLabel: 'em silêncio', emoji: '🤫', title: 'Sala Silenciosa (só foco)' },
]

const DEFAULT_CTA = 'Conectar com Minha Dupla Agora'

export default function Hero({ onSelect }: { onSelect?: (choice: IntentChoice | null) => void }) {
  const [active, setActive] = useState<IntentChoice | null>(null)
  const [searching, setSearching] = useState(false)
  const liveCount = useLiveCount()

  function handleClick(choice: IntentChoice) {
    const next = active === choice ? null : choice
    setActive(next)
    onSelect?.(next)
  }

  function handleMainCta() {
    if (searching) return
    setSearching(true)
    // Micro-pausa intencional: dá a sensação de que o app está de fato
    // procurando sua dupla, antes de rolar pro mural onde os pedidos
    // reais já estão esperando. Nenhum dado é inventado — é só ritmo de UI.
    setTimeout(() => {
      setSearching(false)
      document.getElementById('mural')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 900)
  }

  const ctaText = active
    ? `Conectar agora ${CHOICES.find((c) => c.choice === active)?.ctaLabel}`
    : DEFAULT_CTA

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-16">
      <div className="absolute -top-10 left-1/4 w-[420px] h-[420px] glow-purple rounded-full blur-3xl -z-10" />
      <div className="absolute top-32 right-0 w-[360px] h-[360px] glow-pink rounded-full blur-3xl -z-10" />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-ring" />
            <span className="text-xs font-medium text-zinc-300">
              {liveCount === null
                ? 'Carregando...'
                : liveCount === 0
                ? 'Você é um dos primeiros por aqui — chama alguém pra topar'
                : liveCount < 5
                ? 'Fase Beta — seja um dos pioneiros a testar o DUOS hoje'
                : `${liveCount} pessoas buscando dupla agora`}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.08] tracking-tight text-white">
            Nunca faça nada sozinho.
            <br />
            <span className="gradient-text">Encontre sua dupla</span> para hoje.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-md mx-auto lg:mx-0">
            Conecte-se com 1 pessoa agora para jogar, estudar ou tirar um projeto do papel — juntos.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={handleMainCta}
              disabled={searching}
              className="cta-gradient hover:scale-105 transition-transform flex items-center justify-center gap-2 text-white font-bold text-base px-7 py-4 rounded-2xl ring-1 ring-white/10 disabled:opacity-90"
            >
              {searching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Buscando sua dupla ideal...</span>
                </>
              ) : (
                <>
                  ⚡ <span>{ctaText}</span>
                </>
              )}
            </button>
            <a
              href="#recompensas"
              className="flex items-center justify-center gap-2 text-zinc-300 font-medium px-7 py-4 rounded-2xl border border-white/10 hover:border-white/25 hover:text-white transition-colors"
            >
              Ver recompensas
            </a>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Sem taxa. Sem compromisso de câmera. Cancele a dupla quando quiser.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet/20 via-transparent to-pink/20 blur-2xl -z-10" />
          <div className="bg-surface border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Escolha 1 e comece agora
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {CHOICES.map((c) => (
                <button
                  key={c.choice}
                  type="button"
                  onClick={() => handleClick(c.choice)}
                  className={`intent-card relative flex sm:flex-col items-center gap-3 sm:gap-2 bg-surface2 border border-white/10 rounded-2xl p-4 sm:py-6 text-left sm:text-center ${
                    active === c.choice ? 'active' : ''
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{c.emoji}</span>
                  <span className="text-sm font-semibold text-white">{c.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-surface2/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-400">
              <span>
                {active
                  ? {
                      jogar: 'Achamos 3 pessoas online agora pra um co-op rápido 🎮',
                      estudar: 'Tem gente estudando pra prova agora — bora focar junto 📚',
                      projeto: 'Encontramos gente com ideias parecidas pra trocar figurinha 💡',
                      silencio: 'Sala sem papo — só presença e foco, do seu lado 🤫',
                    }[active]
                  : 'Escolhe um card pra ver sua dupla mais próxima ✨'}
              </span>
              <span className="text-zinc-500 shrink-0 ml-3">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
