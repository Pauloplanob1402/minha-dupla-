'use client'

import { useAnonAuth } from '@/lib/supabase/useAnonAuth'
import { useReferral } from '@/lib/supabase/useReferral'

// Componente "invisível": só existe pra rodar o hook de referral assim
// que a sessão (mesmo anônima) estiver pronta. Não renderiza nada.
export default function ReferralTracker() {
  const { userId } = useAnonAuth()
  useReferral(userId)
  return null
}
