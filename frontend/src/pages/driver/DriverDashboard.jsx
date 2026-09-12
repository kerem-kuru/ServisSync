import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, User, CheckCircle2, Navigation, AlertCircle } from 'lucide-react'
import { attendanceApi } from '../../services/api'

export default function DriverDashboard() {
  const [driverData, setDriverData] = useState(null)
  const [direction, setDirection] = useState('morning') // 'morning' or 'evening'
  const [loadingAction, setLoadingAction] = useState(null)
  const [attendanceState, setAttendanceState] = useState({ morning: {}, evening: {} }) // { morning: { studentId: status }, evening: { ... } }
  const navigate = useNavigate()

  useEffect(() => {
    const vehicleData = localStorage.getItem('driver_vehicle')
    const studentsData = localStorage.getItem('driver_students')
    
    if (!vehicleData || !studentsData) {
      navigate('/login')
    } else {
      setDriverData({
        vehicle: JSON.parse(vehicleData),
        students: JSON.parse(studentsData)
      })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('driver_token')
    localStorage.removeItem('driver_vehicle')
    localStorage.removeItem('driver_students')
    navigate('/login')
  }

  const handleAttendance = async (studentId, status) => {
    // Prevent multiple clicks
    if (loadingAction === studentId) return

    setLoadingAction(studentId)
    
    // Haptic feedback (Vibrate for 50ms)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    try {
      await attendanceApi.log({
        student_id: studentId,
        status,
        direction
      })
      
      setAttendanceState(prev => ({
        ...prev,
        [direction]: {
          ...prev[direction],
          [studentId]: status
        }
      }))
    } catch (err) {
      console.error('Yoklama alınamadı:', err)
      alert('İşlem başarısız oldu. İnternet bağlantınızı kontrol edin.')
    } finally {
      setLoadingAction(null)
    }
  }

  if (!driverData) return null

  const vehicle = driverData.vehicle
  const students = driverData.students

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 fade-in pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">{vehicle.plate_number}</h1>
            <p className="text-[13px] font-bold text-gray-500 mt-0.5">{vehicle.driver_name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 border border-red-100 active:scale-95 transition-transform"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5}/>
            Çıkış
          </button>
        </div>
        
        {/* Toggle Direction */}
        <div className="mt-5 flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
          <button
            onClick={() => setDirection('morning')}
            className={`flex-1 rounded-xl py-3 text-[15px] font-black transition-all ${
              direction === 'morning'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sabah (Evden Okula)
          </button>
          <button
            onClick={() => setDirection('evening')}
            className={`flex-1 rounded-xl py-3 text-[15px] font-black transition-all ${
              direction === 'evening'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Akşam (Okuldan Eve)
          </button>
        </div>
      </header>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {students.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-bold">
            Bu araca kayıtlı öğrenci bulunmuyor.
          </div>
        ) : (
          students.map((student) => {
            const currentStatus = attendanceState[direction][student.id]
            
            // Border color based on status
            let cardBorder = 'border-gray-200'
            if (currentStatus === 'boarded') cardBorder = 'border-green-500 ring-4 ring-green-50'
            if (currentStatus === 'dropped') cardBorder = 'border-blue-500 ring-4 ring-blue-50'
            if (currentStatus === 'absent') cardBorder = 'border-gray-400 opacity-60'

            return (
              <div 
                key={student.id} 
                className={`bg-white rounded-[24px] border-2 p-5 shadow-sm transition-all ${cardBorder}`}
              >
                {/* Student Info */}
                <div className="mb-5">
                   <h2 className="text-[22px] font-black text-gray-900 leading-tight">
                     {student.first_name} {student.last_name}
                   </h2>
                   <div className="mt-2 space-y-1.5">
                     <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-500">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {student.pickup_address || 'Adres girilmemiş'}
                     </div>
                     <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-500">
                        <User className="h-4 w-4 text-gray-400" />
                        {student.parent_name || 'Veli girilmemiş'} ({student.parent_phone || 'Tel yok'})
                     </div>
                   </div>
                </div>

                {/* Big Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={() => handleAttendance(student.id, 'boarded')}
                     disabled={loadingAction === student.id}
                     className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 text-lg font-black transition-all active:scale-95
                        ${currentStatus === 'boarded' 
                           ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                           : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                   >
                     <CheckCircle2 className="h-8 w-8" strokeWidth={2.5}/>
                     BİNDİ
                   </button>
                   
                   <button
                     onClick={() => handleAttendance(student.id, 'dropped')}
                     disabled={loadingAction === student.id}
                     className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 text-lg font-black transition-all active:scale-95
                        ${currentStatus === 'dropped' 
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                           : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                   >
                     <Navigation className="h-8 w-8" strokeWidth={2.5}/>
                     İNDİ
                   </button>
                </div>

                {/* Absent Button */}
                <button
                   onClick={() => handleAttendance(student.id, 'absent')}
                   disabled={loadingAction === student.id}
                   className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold transition-all active:scale-95
                      ${currentStatus === 'absent'
                         ? 'bg-gray-800 text-white shadow-md'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                >
                   <AlertCircle className="h-5 w-5" strokeWidth={2.5}/>
                   Bugün Gelmedi
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
