import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Navigation, MessageCircle, RefreshCw } from 'lucide-react'

export default function InteractiveHeroSimulator() {
  const [boarded, setBoarded] = useState(false)
  const [messageDelivered, setMessageDelivered] = useState(false)
  
  // Create a ref for audio to avoid errors if browser blocks autoplay, but we only play on click
  const clickAudio = useRef(null)
  const notificationAudio = useRef(null)

  useEffect(() => {
    clickAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3')
    notificationAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    clickAudio.current.volume = 0.5
    notificationAudio.current.volume = 0.5
  }, [])

  const handleBoardClick = () => {
    if (boarded) return
    
    // Play click sound
    if (clickAudio.current) clickAudio.current.play().catch(()=>console.log('Audio blocked'))
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50)

    setBoarded(true)

    // Simulate WhatsApp delay
    setTimeout(() => {
      setMessageDelivered(true)
      if (notificationAudio.current) notificationAudio.current.play().catch(()=>console.log('Audio blocked'))
    }, 800)
  }

  const handleReset = () => {
    setBoarded(false)
    setMessageDelivered(false)
  }

  return (
    <div className="relative mx-auto max-w-lg lg:max-w-none flex flex-col sm:flex-row items-center gap-6 justify-center">
      
      {/* Phone 1: Driver App */}
      <div className="w-[280px] shrink-0 rounded-[2.5rem] border-8 border-gray-900 bg-gray-50 shadow-2xl relative overflow-hidden h-[500px] flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
        
        {/* App Header */}
        <div className="bg-white pt-10 pb-4 px-4 shadow-sm z-10">
          <div className="text-center">
            <h3 className="font-black text-gray-900">34 ABC 123</h3>
            <p className="text-xs font-bold text-gray-500">Sabah Servisi</p>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <motion.div 
            animate={boarded ? { scale: [1, 1.05, 1], borderColor: '#22c55e' } : {}}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-[20px] p-5 shadow-sm border-2 ${boarded ? 'border-green-500 bg-green-50/30' : 'border-gray-200'}`}
          >
            <h4 className="text-xl font-black text-gray-900 text-center mb-1">Ali Kaya</h4>
            <p className="text-xs font-bold text-gray-500 text-center mb-6">Atatürk Mah. Gül Sokak</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleBoardClick}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-black transition-all ${
                  boarded ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <CheckCircle2 className="h-6 w-6" />
                BİNDİ
              </button>
              <button disabled={boarded} className="flex items-center justify-center gap-2 rounded-xl py-3 font-black bg-blue-50 text-blue-700 opacity-50 cursor-not-allowed">
                <Navigation className="h-6 w-6" />
                İNDİ
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Connection Line (Hidden on Mobile) */}
      <div className="hidden sm:flex flex-col items-center justify-center w-12">
        <div className="w-full h-1 bg-gray-200 rounded-full relative overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={boarded ? { x: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-full bg-green-500"
          ></motion.div>
        </div>
      </div>

      {/* Phone 2: WhatsApp Mockup */}
      <div className="w-[280px] shrink-0 rounded-[2.5rem] border-8 border-gray-900 bg-[#e5ddd5] shadow-2xl relative overflow-hidden h-[500px] flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
        
        {/* WhatsApp Header */}
        <div className="bg-[#075e54] pt-10 pb-3 px-4 shadow-md z-10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-[#075e54]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">ServisSync Bot</h3>
            <p className="text-[10px] text-white/80 font-medium">Çevrimiçi</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
          <AnimatePresence>
            {messageDelivered && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom left' }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[85%] relative self-start"
              >
                <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                  📢 <b>Bilgilendirme</b><br/><br/>
                  Sayın Velimiz, <b>Ali Kaya</b> saat 07:42 itibarıyla servise güvenle bindi.<br/><br/>
                  🚌 Plaka: <b>34 ABC 123</b>
                </p>
                <div className="text-[10px] text-gray-400 text-right mt-1">07:42</div>
                
                {/* Tail pointing left */}
                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Floating Reset Button */}
      <AnimatePresence>
        {messageDelivered && (
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-xl border border-gray-200 hover:text-blue-600 hover:border-blue-200 transition-colors z-30"
          >
            <RefreshCw className="h-4 w-4" />
            Simülatörü Sıfırla
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  )
}
