'use client'

import { useEffect } from 'react'
import { createClient } from './client'

// Lê ?convite=<id_de_quem_indicou> da URL e vincula esse indicador ao
// perfil do usuário atual, uma única vez (não sobrescreve se já tiver
// um referred_by definido, e ignora auto-indicação).
export function useReferral(userId: string | null) {
  useEffect(() => {
    if (!userId) return

    const params = new URLSearchParams(window.location.search)
    const referrerId = params.get('convite')
    if (!referrerId || referrerId === userId) return

    async function linkReferral() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single()

      if (data && !data.referred_by) {
        await supabase.from('profiles').update({ referred_by: referrerId }).eq('id', userId)
      }
    }

    linkReferral()
  }, [userId])
}
