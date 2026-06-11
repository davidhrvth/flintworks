import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { DocumentLang } from './components/layout/DocumentLang'
import Home from './pages/Home'
import Services from './pages/Services'
import Marketing from './pages/Marketing'
import Pricing from './pages/Pricing'
import Work from './pages/Work'
import Studio from './pages/Studio'
import About from './pages/About'
import Contact from './pages/Contact'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocumentLang />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/work" element={<Work />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
