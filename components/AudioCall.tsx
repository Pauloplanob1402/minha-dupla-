'use client'

import { useEffect, useRef, useState } from 'react'
import type { DailyCall } from '@daily-co/daily-js'

type Status = 'connecting' | 'joined' | 'error' | 'ended'

export default function AudioCall({
  roomId,
  endsAt,
  leave,
}: {
  roomId: string
  endsAt: string
  leave: boolean
}) {
  const [status, setStatus] = useState<Status>('connecting')
  const [micOn, setMicOn] = useState(true)
  const [remoteJoined, setRemoteJoined] = useState(false)
  const callRef = useRef<DailyCall | null>(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const res = await fetch('/api/daily-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, expiresAt: endsAt }),
        })
        const data = await res.json()
        if (!res.ok || !data.url) throw new Error(data.error || 'Sem URL de áudio')
        if (cancelled) return

        const DailyIframe = (await import('@daily-co/daily-js')).default
        const call = DailyIframe.createCallObject()
        callRef.current = call

        call.on('joined-meeting', () => !cancelled && setStatus('joined'))
        call.on('error', () => !cancelled && setStatus('error'))
        call.on('participant-joined', (ev) => {
          if (!ev.participant.local) setRemoteJoined(true)
        })
        call.on('participant-left', (ev) => {
          if (!ev.participant.local) setRemoteJoined(false)
        })
        call.on('track-started', (ev) => {
          if (ev.participant?.local || ev.track.kind !== 'audio') return
          const audioEl = document.createElement('audio')
          audioEl.autoplay = true
          audioEl.srcObject = new MediaStream([ev.track])
          audioEl.dataset.dailyAudio = ev.participant?.session_id ?? ''
          document.body.appendChild(audioEl)
        })
        call.on('track-stopped', (ev) => {
          const el = document.querySelector(
            `audio[data-daily-audio="${ev.participant?.session_id}"]`
          )
          el?.remove()
        })

        await call.join({ url: data.url, startVideoOff: true, startAudioOff: false })
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    start()

    return () => {
      cancelled = true
      callRef.current?.leave()
      callRef.current?.destroy()
      document.querySelectorAll('audio[data-daily-audio]').forEach((el) => el.remove())
    }
  }, [roomId, endsAt])

  // Sai da chamada quando o timer da sala acaba
  useEffect(() => {
    if (!leave || !callRef.current) return
    callRef.current.leave()
    setStatus('ended')
  }, [leave])

  function toggleMic() {
    if (!callRef.current) return
    const next = !micOn
    callRef.current.setLocalAudio(next)
    setMicOn(next)
  }

  const statusText =
    status === 'connecting'
      ? 'Conectando áudio...'
      : status === 'error'
      ? 'Não deu pra conectar o áudio'
      : status === 'ended'
      ? 'Áudio encerrado'
      : remoteJoined
      ? 'Áudio conectado 🎙️'
      : 'Você está na sala — esperando a outra pessoa entrar no áudio'

  const dotColor =
    status === 'joined' && remoteJoined
      ? 'bg-emerald'
      : status === 'error'
      ? 'bg-pink'
      : 'bg-amber'

  return (
    <div className="flex items-center justify-between gap-3 bg-surface border border-white/10 rounded-xl px-4 py-3 mt-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        <p className="text-xs sm:text-sm text-zinc-300 truncate">{statusText}</p>
      </div>

      {status === 'joined' && (
        <button
          type="button"
          onClick={toggleMic}
          className={`shrink-0 text-xs font-semibold rounded-full px-3.5 py-2 border transition-colors ${
            micOn
              ? 'text-white border-white/20 hover:bg-white/10'
              : 'text-pink border-pink/40 bg-pink/10'
          }`}
        >
          {micOn ? '🎙️ Mudo' : '🔇 Ativar mic'}
        </button>
      )}
    </div>
  )
}
