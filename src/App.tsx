import { Header } from './components/navigation/Header'
import { Hero } from './components/hero/Hero'
import { Mission } from './components/mission/Mission'
import { Impact } from './components/impact/Impact'
import { DonationSection } from './components/donation/DonationSection'
import { Testimonials } from './components/testimonials/Testimonials'
import { FAQ } from './components/faq/FAQ'
import { Footer } from './components/layout/Footer'

function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <div id="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />
        <Hero />
        <Mission />
        <Impact />
        <DonationSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}

export default App
