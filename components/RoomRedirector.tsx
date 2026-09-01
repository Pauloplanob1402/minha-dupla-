'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAnonAuth } from '@/lib/supabase/useAnonAuth'

// Fica escutando, em tempo real, se uma sala foi criada com o usuário atual
// como participante (seja user_a ou user_b) e redireciona pra lá na hora.
// Isso é essencial pra quem POSTOU o pedido no mural: quem clica em "Topar
// Dupla" já é redirecionado direto no código do Mural, mas quem só ficou
// esperando o pedido dele ser aceito não tinha nenhum jeito de saber —
// esse componente resolve isso.
export default function RoomRedirector() {
  const { userId } = useAnonAuth()
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    const channelA = supabase
      .channel(`rooms-as-a-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rooms', filter: `user_a=eq.${userId}` },
        (payload) => {
          router.push(`/sala/${(payload.new as { id: string }).id}`)
        }
      )
      .subscribe()

    const channelB = supabase
      .channel(`rooms-as-b-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rooms', filter: `user_b=eq.${userId}` },
        (payload) => {
          router.push(`/sala/${(payload.new as { id: string }).id}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelA)
      supabase.removeChannel(channelB)
    }
  }, [userId, router])

  return null
}
