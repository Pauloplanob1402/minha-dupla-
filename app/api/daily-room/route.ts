import { NextResponse } from 'next/server'

// Cria (ou reaproveita, se já existir) uma sala de áudio no Daily.co pra
// cada sala de conexão do DUOS. A chave de API do Daily NUNCA vai pro
// navegador — essa rota roda só no servidor, e é o navegador que chama
// essa rota (não a API do Daily diretamente).
export async function POST(request: Request) {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DAILY_API_KEY não configurada no servidor.' },
      { status: 500 }
    )
  }

  const { roomId, expiresAt } = await request.json()
  if (!roomId) {
    return NextResponse.json({ error: 'roomId é obrigatório.' }, { status: 400 })
  }

  // Nome determinístico: os dois participantes da mesma sala do DUOS
  // sempre calculam o mesmo nome, então caem na mesma sala do Daily.
  const dailyRoomName = `duos-${roomId}`
  const expUnix = expiresAt
    ? Math.floor(new Date(expiresAt).getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 15 * 60

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  // Tenta criar. Se já existir (a outra pessoa da dupla chegou primeiro),
  // busca a sala existente em vez de dar erro.
  const createRes = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: dailyRoomName,
      properties: {
        exp: expUnix,
        eject_at_room_exp: true,
        enable_chat: false,
        enable_screenshare: false,
        start_video_off: true,
        start_audio_off: false,
        max_participants: 2,
      },
    }),
  })

  if (createRes.ok) {
    const data = await createRes.json()
    return NextResponse.json({ url: data.url })
  }

  // 400 aqui normalmente significa "sala já existe" — busca ela.
  const getRes = await fetch(`https://api.daily.co/v1/rooms/${dailyRoomName}`, { headers })
  if (getRes.ok) {
    const data = await getRes.json()
    return NextResponse.json({ url: data.url })
  }

  const errText = await createRes.text()
  return NextResponse.json({ error: errText }, { status: 500 })
}
