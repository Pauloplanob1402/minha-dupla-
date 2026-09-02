'use client'

import { useRef, useState } from 'react'

type Status = 'idle' | 'sharing' | 'done' | 'error'

export default function AchievementCard({
  otherName,
  minutes = 15,
}: {
  otherName: string
  minutes?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  async function handleShare() {
    if (!cardRef.current) return
    setStatus('sharing')

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'duos-conquista.png', { type: 'image/png' })
      const shareText = `Hoje eu e ${otherName} produzimos ${minutes} min juntos no DUOS 🚀`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'DUOS', text: shareText })
      } else {
        // Sem suporte a compartilhar arquivo (comum em desktop): baixa a imagem
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'duos-conquista.png'
        link.click()
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-4">
      <div
        ref={cardRef}
        className="w-full max-w-xs mx-auto aspect-[9/16] rounded-3xl p-6 flex flex-col justify-between"
        style={{ background: 'linear-gradient(160deg, #8B5CF6 0%, #EC4899 100%)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
            🤝
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">DUOS</span>
        </div>
        <div>
          <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Conquista de hoje</p>
          <p className="text-white font-extrabold text-2xl leading-tight">
            Eu e {otherName}
            <br />
            produzimos {minutes} min juntos 🚀
          </p>
        </div>
        <p className="text-white/70 text-xs">minhadupla.com.br</p>
      </div>

      <button
        type="button"
        onClick={handleShare}
        disabled={status === 'sharing'}
        className="mt-3 w-full max-w-xs mx-auto flex cta-gradient text-white font-semibold text-sm rounded-xl px-5 py-3 items-center justify-center disabled:opacity-60"
      >
        {status === 'sharing'
          ? 'Gerando imagem...'
          : status === 'done'
          ? 'Compartilhado ✅'
          : status === 'error'
          ? 'Tenta de novo'
          : '📤 Compartilhar conquista'}
      </button>
    </div>
  )
}
