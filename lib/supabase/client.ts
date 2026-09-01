import { createBrowserClient } from '@supabase/ssr'

// Cliente Supabase pro navegador (client components).
// As duas variáveis abaixo vêm do seu projeto Supabase: Settings > API.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
