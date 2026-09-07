import { useEffect, useState } from 'react'
import { GraduationCap, CreditCard, Bus, Phone, MapPin, ChevronRight } from 'lucide-react'
import StatCard from '../components/StatCard'
import { vehicleApi, studentApi, paymentApi } from '../services/api'
import { Link } from 'react-router-dom'

export default function OverviewPage() {
  const [stats, setStats] = useState({
    vehicles: 0,
    students: 0,
    pendingPayments: 0,
    paidPayments: 0,
  })
  
  const [recentStudents, setRecentStudents] = useState([])
  const [vehiclesList, setVehiclesList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, studentsRes, paymentsRes] = await Promise.all([
          vehicleApi.list(),
          studentApi.list(),
          paymentApi.list(),
        ])

        const vehicles = vehiclesRes.data.results || vehiclesRes.data || []
        const students = studentsRes.data.results || studentsRes.data || []
        const payments = paymentsRes.data.results || paymentsRes.data || []

        setStats({
          vehicles: vehicles.length,
          students: students.length,
          pendingPayments: payments.filter((p) => p.status === 'pending').length,
          paidPayments: payments.filter((p) => p.status === 'paid').length,
        })
        
        // Grab last 5 students
        setRecentStudents(students.slice(-5).reverse())
        setVehiclesList(vehicles)
      } catch (err) {
        console.error('Veri yüklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8 fade-in">
      
      <div className="flex flex-col gap-2">
           <h1 className="text-[32px] font-black text-gray-900 tracking-tight">Genel Bakış</h1>
           <p className="text-[16px] text-gray-500 font-medium">Şirket verileriniz ve anlık sistem özeti.</p>
      </div>

      {/* Stats Grid - 4 Columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Bus}
          label="Sistemdeki Araçlar"
          value={loading ? '0' : stats.vehicles}
          sublabel="Aktif operasyonda"
          color="blue"
        />
        <StatCard
          icon={GraduationCap}
          label="Kayıtlı Öğrenciler"
          value={loading ? '0' : stats.students}
          sublabel="Tüm kayıtlar"
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          label="Bekleyen Aidatlar"
          value={loading ? '0' : stats.pendingPayments}
          sublabel="Ödeme bekliyor"
          color="orange"
        />
        <StatCard
          icon={CreditCard}
          label="Tahsil Edilenler"
          value={loading ? '0' : stats.paidPayments}
          sublabel="Başarılı işlemler"
          color="green"
        />
      </div>

      {/* Data Density Area - Full Width Grids */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
         {/* Recent Students Table */}
         <div className="glass-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
               <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Son Eklenen Öğrenciler</h3>
               <Link to="/students" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">Tümünü Gör <ChevronRight className="h-4 w-4"/></Link>
            </div>
            <div className="overflow-x-auto flex-1 bg-white">
               <table className="w-full">
                 <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                     <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400">Öğrenci</th>
                     <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400">İletişim</th>
                     <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400">Aidat</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {loading ? (
                       <tr><td colSpan="3" className="p-8 text-center text-gray-500 font-semibold">Yükleniyor...</td></tr>
                   ) : recentStudents.length === 0 ? (
                       <tr><td colSpan="3" className="p-12 text-center text-gray-400 font-semibold text-[15px]">Henüz öğrenci kaydı bulunamadı.</td></tr>
                   ) : (
                       recentStudents.map(student => (
                           <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="text-[15px] font-bold text-gray-900">{student.first_name} {student.last_name}</div>
                                  <div className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                      {student.pickup_address ? (student.pickup_address.length > 25 ? student.pickup_address.substring(0, 25) + '...' : student.pickup_address) : 'Adres yok'}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="text-[14px] font-bold text-gray-700">{student.parent_name || 'Veli yok'}</div>
                                  <div className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                                      {student.parent_phone || '—'}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex rounded-lg bg-green-50 px-3 py-1.5 text-[14px] font-black text-green-700 border border-green-200 shadow-sm">
                                      ₺{Number(student.monthly_fee).toLocaleString('tr-TR')}
                                  </span>
                              </td>
                           </tr>
                       ))
                   )}
                 </tbody>
               </table>
            </div>
         </div>

         {/* Vehicle Fleet Status */}
         <div className="glass-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
               <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Filo Durumu</h3>
               <Link to="/vehicles" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">Tümünü Gör <ChevronRight className="h-4 w-4"/></Link>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[450px] bg-gray-50/30">
               {loading ? (
                   <div className="text-center text-gray-500 font-semibold py-8">Yükleniyor...</div>
               ) : vehiclesList.length === 0 ? (
                   <div className="text-center text-gray-400 font-semibold text-[15px] py-12">Kayıtlı araç yok.</div>
               ) : (
                   vehiclesList.map(vehicle => (
                       <div key={vehicle.id} className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                           <div className="flex items-center gap-4">
                               <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                                   <Bus className="h-6 w-6" strokeWidth={2.5}/>
                               </div>
                               <div>
                                   <h4 className="text-[16px] font-black text-gray-900 tracking-wide">{vehicle.plate_number}</h4>
                                   <p className="text-[13px] font-bold text-gray-500 mt-0.5">{vehicle.driver_name || 'Şoför atanmadı'}</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-[26px] font-black text-gray-900 leading-none">{vehicle.student_count || 0}</div>
                               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Öğrenci</div>
                           </div>
                       </div>
                   ))
               )}
            </div>
         </div>
      </div>

    </div>
  )
}
