import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function PWABanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Check if it's already installed or dismissed
    const isDismissed = localStorage.getItem('pwaBannerDismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    
    if (isDismissed || isStandalone) {
      return
    }

    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI to notify the user they can add to home screen
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Fallback for iOS Safari or Desktop testing if beforeinstallprompt doesn't fire
    setTimeout(() => {
      if (!isStandalone && !isDismissed) {
        setShow(true)
      }
    }, 1000) // 1 second delay to give beforeinstallprompt a chance to fire first

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback message if prompt is not available
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
      if (isIos) {
        alert("iPhone'da Ana Ekrana Eklemek için tarayıcının alt menüsündeki 'Paylaş' (Kare ve yukarı ok) ikonuna dokunun ve 'Ana Ekrana Ekle'yi seçin.")
      } else {
        alert("Tarayıcınızın menüsünden 'Ana Ekrana Ekle' (Add to Home Screen) veya 'Uygulamayı Yükle' seçeneğini kullanarak kurulum yapabilirsiniz.")
      }
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwaBannerDismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="sticky top-0 left-0 z-50 w-full bg-blue-600 px-4 py-3 text-white shadow-md slide-down">
      <div className="flex items-center justify-between mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Uygulamayı Ana Ekrana Ekle</p>
            <p className="text-[12px] font-medium text-blue-100">(Tek Tıkla Aç)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="rounded-xl bg-white px-3 py-1.5 text-sm font-black text-blue-600 active:scale-95"
          >
            Ekle
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-xl p-2 text-blue-200 hover:text-white active:bg-blue-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
