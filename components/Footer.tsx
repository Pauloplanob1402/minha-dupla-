export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Termos de Uso
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Privacidade
          </a>
        </div>
        <p className="text-xs text-zinc-600">
          Uso exclusivo para maiores de 18 anos. Conexões 100% digitais.
        </p>
        <p className="text-xs text-zinc-700">© 2026 DUOS</p>
      </div>
    </footer>
  )
}
