'use client'

import { useEffect, useState } from 'react'
import { createClient } from './client'

// Conta quantas intenções estão abertas nos últimos 30 min — prova social
// REAL, em vez de um número fixo inventado. Se o número for baixo (fase
// inicial), o componente que usa esse hook deve mostrar uma mensagem
// honesta em vez de fingir escala que ainda não existe.
export function useLiveCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchCount() {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { count: c } = await supabase
        .from('intentions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('created_at', thirtyMinAgo)
      setCount(c ?? 0)
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)

    const channel = supabase
      .channel('live-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intentions' }, () => {
        fetchCount()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  return count
}
