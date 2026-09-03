import Image from 'next/image'
import logoDuos from '@/public/logo-duos.png'

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <Image src={logoDuos} alt="DUOS" priority className="h-7 w-auto" />
      </div>
    </header>
  )
}
