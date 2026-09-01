import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'DUOS — Encontre sua dupla para hoje',
  description:
    'Nunca faça nada sozinho. Conecte-se com 1 pessoa agora para jogar, estudar ou criar algo juntos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="relative bg-base text-zinc-100 font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
