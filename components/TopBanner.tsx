export default function TopBanner() {
  return (
    <div className="bg-gradient-to-r from-violet/20 via-pink/20 to-violet/20 border-b border-white/10 py-2.5 px-4 text-center text-xs sm:text-sm text-zinc-300">
      <span className="inline-flex items-center gap-1.5">
        <span className="text-base">⏳</span>
        <span>
          Enquanto você rola o feed das redes sociais,{' '}
          <strong>outras pessoas estão criando algo novo juntas no DUOS.</strong>
        </span>
      </span>
    </div>
  )
}
