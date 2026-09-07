import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, CreditCard, ChevronRight } from 'lucide-react'

const tabs = [
  { id: 'tracking', label: 'Canlı Servis Takibi', icon: LayoutDashboard },
  { id: 'assignment', label: 'Öğrenci & Servis Atama', icon: Users },
  { id: 'billing', label: 'Aidat & Tahsilat Paneli', icon: CreditCard },
]

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('tracking')

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Her Şey Tek Bir Yerde.</h2>
        <p className="text-lg text-gray-500 font-medium">Karmaşık excel dosyalarından kurtulun, tüm operasyonu tek ekrandan yönetin.</p>
      </div>

      {/* Mac Window Mockup */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
        
        {/* Mac Titlebar */}
        <div className="bg-slate-100 border-b border-gray-200 px-4 py-3 flex items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 text-center text-xs font-bold text-gray-400">servissync.com/admin</div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex flex-col md:flex-row h-[600px] bg-slate-50">
          
          {/* Sidebar Mock */}
          <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 shrink-0">
            <div className="flex items-center gap-2 mb-8 px-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
               <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 p-8 overflow-hidden relative">
             <AnimatePresence mode="wait">
               
               {activeTab === 'tracking' && (
                 <motion.div 
                   key="tracking"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="h-full flex flex-col gap-6"
                 >
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 mb-2">AKTİF SEFERLER</div>
                        <div className="text-3xl font-black text-gray-900">12<span className="text-sm font-bold text-green-500 ml-2">Tümü Yolda</span></div>
                      </div>
                      <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 mb-2">YOKLAMA ORANI</div>
                        <div className="text-3xl font-black text-gray-900">%94<span className="text-sm font-bold text-gray-400 ml-2">Bindi</span></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                       <div className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Canlı Araç Durumları</div>
                       <div className="space-y-3">
                         {[1,2,3].map((i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-100">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">34AB{i}</div>
                               <div>
                                 <div className="text-sm font-bold text-gray-900">Ahmet Şoför</div>
                                 <div className="text-xs text-gray-500">18/20 Öğrenci Bindi</div>
                               </div>
                             </div>
                             <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Hareket Halinde</div>
                           </div>
                         ))}
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'assignment' && (
                 <motion.div 
                   key="assignment"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="h-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                 >
                    <div className="flex justify-between items-center mb-6">
                      <div className="font-bold text-gray-900">Öğrenci Listesi</div>
                      <div className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl">Öğrenci Ekle</div>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-gray-400 border-b border-gray-100">
                          <th className="pb-3">Öğrenci</th>
                          <th className="pb-3">Veli İletişim</th>
                          <th className="pb-3">Atanan Servis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {['Ayşe Yılmaz', 'Can Polat', 'Elif Demir'].map((name, i) => (
                          <tr key={name}>
                            <td className="py-4 text-sm font-bold text-gray-900">{name}</td>
                            <td className="py-4 text-sm text-gray-500">0532 *** ** **</td>
                            <td className="py-4">
                              <select className="bg-slate-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 font-semibold text-gray-700 outline-none">
                                <option>34 ABC 123 (Sabah)</option>
                                <option>34 DEF 456 (Öğle)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </motion.div>
               )}

               {activeTab === 'billing' && (
                 <motion.div 
                   key="billing"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="h-full flex flex-col gap-6"
                 >
                    <div className="flex gap-4">
                      <div className="flex-1 bg-orange-50 p-5 rounded-2xl border border-orange-100">
                        <div className="text-xs font-bold text-orange-600 mb-1">BEKLEYEN TAHSİLAT</div>
                        <div className="text-2xl font-black text-orange-700">₺12.450</div>
                      </div>
                      <div className="flex-1 bg-green-50 p-5 rounded-2xl border border-green-100">
                        <div className="text-xs font-bold text-green-600 mb-1">BU AY TAHSİL EDİLEN</div>
                        <div className="text-2xl font-black text-green-700">₺45.000</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                      <div className="font-bold text-gray-900 mb-4">Geciken Ödemeler</div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                          <div>
                            <div className="text-sm font-bold text-gray-900">Mehmet Karaca <span className="text-xs font-normal text-gray-500">(Kasım Aidatı)</span></div>
                            <div className="text-lg font-black text-red-600 mt-0.5">₺1.500</div>
                          </div>
                          <button className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-600">
                            WhatsApp Hatırlatması Gönder <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                 </motion.div>
               )}

             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
