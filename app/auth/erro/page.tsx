export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-white mb-2">
          O link expirou ou já foi usado
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Volta pro site e tenta enviar o link de novo — ele vale só por um tempo limitado.
        </p>
        <a
          href="/"
          className="cta-gradient inline-flex text-white font-semibold px-6 py-3 rounded-xl"
        >
          Voltar pro DUOS
        </a>
      </div>
    </div>
  )
}
