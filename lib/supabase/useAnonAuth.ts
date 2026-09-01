'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from './client'

// Garante que sempre exista uma sessão (mesmo anônima) pra poder gravar
// no banco. Login anônimo é um recurso nativo do Supabase Auth — bom o
// suficiente pro MVP, sem forçar cadastro logo de cara. Quando a pessoa
// decide entrar com e-mail, essa mesma sessão vira permanente (mesmo id),
// então os pontos e o histórico não se perdem.
export function useAnonAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    setUserId(user?.id ?? null)
    setEmail(user?.email ?? null)
    setIsAnonymous(user?.is_anonymous ?? true)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function ensureSession() {
      const { data } = await supabase.auth.getSession()

      if (data.session?.user) {
        setUserId(data.session.user.id)
        setEmail(data.session.user.email ?? null)
        setIsAnonymous(data.session.user.is_anonymous ?? true)
        setLoading(false)
        return
      }

      const { data: signInData, error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('Falha no login anônimo:', error.message)
        setLoading(false)
        return
      }
      setUserId(signInData.user?.id ?? null)
      setIsAnonymous(true)
      setLoading(false)
    }

    ensureSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setEmail(session?.user?.email ?? null)
      setIsAnonymous(session?.user?.is_anonymous ?? true)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return { userId, email, isAnonymous, loading, refresh }
}
