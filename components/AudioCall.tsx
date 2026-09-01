'use client'

// Áudio/vídeo via Jitsi Meet (servidor público meet.jit.si) — 100% grátis,
// sem cartão, sem conta, sem chave de API. Abre numa aba separada porque,
// desde 2023, o meet.jit.si não permite mais embutir (iframe) sem limite
// de tempo; abrindo direto (fora de iframe), não tem limite nenhum.
export default function AudioCall({ roomId }: { roomId: string; endsAt?: string; leave?: boolean }) {
  const jitsiUrl = `https://meet.jit.si/duos-${roomId}#config.startWithVideoMuted=true`

  function openCall() {
    window.open(jitsiUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-surface border border-white/10 rounded-xl px-4 py-3 mt-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />
        <p className="text-xs sm:text-sm text-zinc-300 truncate">
          Áudio em aba separada — grátis, sem conta
        </p>
      </div>

      <button
        type="button"
        onClick={openCall}
        className="shrink-0 cta-gradient text-white text-xs sm:text-sm font-semibold rounded-full px-4 py-2"
      >
        🎧 Entrar na chamada
      </button>
    </div>
  )
}
