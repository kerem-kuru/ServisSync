import { Smartphone, CheckCircle2, CreditCard, MessageCircle, Navigation } from 'lucide-react'

export default function BentoGrid() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Neden ServisSync?</h2>
        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Sıradan takip yazılımlarının aksine, sahada gerçekten işe yarayan pratik çözümler sunuyoruz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* Card 1: Veli Memnuniyeti (Spans 2 cols on tablet/desktop sometimes, but let's do a bento layout: 2 top, 1 full bottom or 1 big left, 2 right) */}
        <div className="md:col-span-2 rounded-[2rem] bg-white p-10 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100 transition-colors"></div>
          <div className="flex-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 text-green-600 mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Velilere Uygulama İndirtme Derdi Yok</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Veliye şifre vermekle, "uygulamaya giremiyorum" şikayetleriyle uğraşmayın. ServisSync, veliyi doğrudan güvendiği kanaldan, <b>WhatsApp</b> üzerinden bilgilendirir.
            </p>
          </div>
          <div className="w-full sm:w-48 shrink-0 bg-slate-50 border border-gray-100 rounded-2xl p-4 shadow-inner">
             <div className="flex gap-2 mb-3">
               <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><MessageCircle className="w-3 h-3 text-white"/></div>
               <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
             </div>
             <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100 text-[10px] font-bold text-gray-600">
               Ahmet servise bindi. Plaka: 34ABC
             </div>
          </div>
        </div>

        {/* Card 2: Şoför Ergonomisi */}
        <div className="rounded-[2rem] bg-gray-900 p-10 border border-gray-800 shadow-xl relative overflow-hidden group text-white">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl z-0 group-hover:bg-blue-500/40 transition-colors"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-800 text-blue-400 mb-6 border border-gray-700">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black mb-3">Şoför Ergonomisi</h3>
            <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
              Direksiyon başında karmaşık menüler yok. Göz ucuyla bulunabilen, titreşim geri bildirimli devasa butonlar.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-500 rounded-xl h-12 flex items-center justify-center shadow-lg"><CheckCircle2 className="w-6 h-6 text-white"/></div>
              <div className="flex-1 bg-blue-500 rounded-xl h-12 flex items-center justify-center shadow-lg"><Navigation className="w-6 h-6 text-white"/></div>
            </div>
          </div>
        </div>

        {/* Card 3: Tahsilat Motoru (Spans 3 cols) */}
        <div className="md:col-span-3 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-10 shadow-2xl relative overflow-hidden group text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white mb-6 backdrop-blur-sm border border-white/10">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-black mb-3">Oto-Tahsilat Motoru</h3>
            <p className="text-blue-100 font-medium text-lg leading-relaxed">
              Her ay "aidat kimden geldi, kim gecikti" excel takibine son. ServisSync aidatları takip eder, gecikenlere tek tıkla hatırlatma WhatsApp mesajı atmanızı sağlar.
            </p>
          </div>
          <div className="w-full md:w-72 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5">
             <div className="text-blue-200 text-xs font-bold mb-1">KASIM AİDATI</div>
             <div className="text-white text-3xl font-black mb-4">₺1.500</div>
             <button className="w-full bg-white text-blue-600 font-black py-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
               WhatsApp ile Hatırlat
             </button>
          </div>
        </div>

      </div>
    </div>
  )
}
