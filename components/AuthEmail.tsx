'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAnonAuth } from '@/lib/supabase/useAnonAuth'

export default function AuthEmail() {
  const { email, isAnonymous, loading, refresh } = useAnonAuth()
  const [inputEmail, setInputEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!inputEmail.trim() || sending) return
    setSending(true)
    setErrorMsg(null)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback`

    // Se a pessoa já está numa sessão anônima, "linkar" o e-mail preserva
    // o mesmo user_id (e portanto os Vibe Points e o histórico). Se por
    // algum motivo não houver sessão anônima, cai pro login normal.
    const { data, error } = isAnonymous
      ? await supabase.auth.updateUser(
          { email: inputEmail.trim() },
          { emailRedirectTo: redirectTo }
        )
      : await supabase.auth.signInWithOtp({
          email: inputEmail.trim(),
          options: { emailRedirectTo: redirectTo },
        })

    setSending(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    // Se a confirmação de e-mail estiver desligada no projeto, o Supabase
    // já aplica o e-mail na hora — sem link nenhum pra clicar. Nesse caso,
    // "data.user.email" já vem preenchido na resposta, então atualizamos
    // o estado local direto em vez de mostrar a tela de "te mandamos um link".
    const alreadyConfirmed = 'user' in data && data.user?.email === inputEmail.trim()
    if (alreadyConfirmed) {
      await refresh()
      return
    }

    setSent(true)
  }

  if (loading) return null

  // Já logado com e-mail confirmado: não mostra o formulário.
  if (email && !isAnonymous) {
    return (
      <p className="text-xs text-zinc-500 text-center">
        Conectado como <span className="text-zinc-300">{email}</span>
      </p>
    )
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto text-center bg-surface border border-white/10 rounded-2xl px-5 py-4">
        <p className="text-sm text-white font-medium">Te mandamos um link ✉️</p>
        <p className="text-xs text-zinc-500 mt-1">
          Abre o e-mail que enviamos pra <span className="text-zinc-300">{inputEmail}</span> e
          clica no link pra confirmar. Seus pontos continuam salvos.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="email"
          required
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 cta-gradient text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Salvar meus pontos'}
        </button>
      </form>
      {errorMsg && <p className="text-xs text-red-400 mt-2 text-center">{errorMsg}</p>}
    </div>
  )
}
