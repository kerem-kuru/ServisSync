import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import InteractiveHeroSimulator from './InteractiveHeroSimulator'
import DashboardPreview from './DashboardPreview'
import BentoGrid from './BentoGrid'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Bus className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Servis<span className="text-blue-600">Sync</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 font-semibold text-[15px] text-gray-600">
              <a href="#simulator" className="hover:text-blue-600 transition-colors">Canlı Simülatör</a>
              <a href="#dashboard" className="hover:text-blue-600 transition-colors">Özellikler</a>
              <a href="#bento" className="hover:text-blue-600 transition-colors">Neden Biz?</a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:block text-[15px] font-bold text-gray-700 hover:text-blue-600 transition-colors">
                Giriş Yap
              </Link>
              <Link to="/register" className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gray-900 px-6 py-2.5 font-bold text-white transition-all hover:scale-105 active:scale-95">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="relative flex items-center gap-2">
                  Hemen Başla <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section & Simulator */}
      <section id="simulator" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 mb-6">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">Türkiye'nin En Modern Servis Yazılımı</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                "Çocuğum nerede kaldı?" <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">telefonlarına son.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 font-medium leading-relaxed">
                Veliye uygulama yükletmekle uğraşmayın. Şoför tek tıkla <b>'Bindi'</b>ye bassın, veliye anında WhatsApp'tan otomatik bilgilendirme gitsin.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95">
                  Ücretsiz Kayıt Ol <ArrowRight className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex -space-x-3">
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200"></div>
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-300"></div>
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-400"></div>
                  </div>
                  <div className="text-sm font-bold text-gray-600 leading-tight">
                    <span className="text-gray-900 block">50+ Servis Aracı</span>
                    Tarafından Aktif Kullanılıyor
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex items-center gap-6 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-5 w-5 text-green-500"/> Kredi Kartı Gerekmez</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-5 w-5 text-green-500"/> 2 Dakikada Kurulum</div>
              </div>
            </motion.div>

            {/* Right Simulator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <InteractiveHeroSimulator />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-24 bg-white">
        <DashboardPreview />
      </section>

      {/* Bento Grid Features */}
      <section id="bento" className="py-24 bg-slate-50">
        <BentoGrid />
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Bus className="h-5 w-5 text-white" strokeWidth={2.5} />
             </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">ServisSync</h2>
          <p className="text-gray-500 font-medium">Modern okul servisi işletmeciliğinin yeni standardı.</p>
          <p className="mt-6 text-sm font-bold text-gray-400">© 2026 ServisSync. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}
