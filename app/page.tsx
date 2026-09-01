import TopBanner from '@/components/TopBanner'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import AuthEmail from '@/components/AuthEmail'
import Mural from '@/components/Mural'
import HistoricalQuote from '@/components/HistoricalQuote'
import HowItWorks from '@/components/HowItWorks'
import CupidMode from '@/components/CupidMode'
import Rewards from '@/components/Rewards'
import Footer from '@/components/Footer'
import ReferralTracker from '@/components/ReferralTracker'

export default function Home() {
  return (
    <>
      <ReferralTracker />
      <TopBanner />
      <Header />
      <Hero />
      <div className="px-6 pb-10">
        <AuthEmail />
      </div>
      <Mural />
      <HistoricalQuote />
      <HowItWorks />
      <CupidMode />
      <Rewards />
      <Footer />
    </>
  )
}
