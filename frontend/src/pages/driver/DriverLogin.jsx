import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Loader2 } from 'lucide-react'
import { driverApi } from '../../services/api'

export default function DriverLogin() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const data = localStorage.getItem('driverData')
    if (data) {
      navigate('/driver/dashboard')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phone) return

    setLoading(true)
    setError('')

    try {
      const res = await driverApi.login(phone)
      
      // Güvenlik & Dashboard için gerekli verileri localStorage'a kaydet
      localStorage.setItem('driver_token', res.data.token)
      localStorage.setItem('driver_vehicle', JSON.stringify(res.data.vehicle))
      localStorage.setItem('driver_students', JSON.stringify(res.data.students))
      
      // Redirect to dashboard
      navigate('/driver/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Kayıtlı araç bulunamadı. Lütfen numaranızı kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 fade-in bg-white">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-600 shadow-xl shadow-blue-600/30 mb-8">
        <Bus className="h-10 w-10 text-white" strokeWidth={2.5} />
      </div>
      
      <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">
        Şoför Girişi
      </h1>
      <p className="mt-3 text-center text-[15px] font-medium text-gray-500 mb-10 px-4">
        Sisteme kayıtlı telefon numaranızı girerek rotanızı başlatın.
      </p>

      <form onSubmit={handleLogin} className="w-full space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700 ml-1">
            Cep Telefonu Numaranız
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Örn: 05551234567"
            required
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-center tracking-widest"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 text-center border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !phone}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4.5 text-lg font-black text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            'Giriş Yap'
          )}
        </button>
      </form>
    </div>
  )
}
