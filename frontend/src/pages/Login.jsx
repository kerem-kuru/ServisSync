import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowRight, Building2, Car } from 'lucide-react'
import { authApi } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('company') // 'company' | 'driver'
  
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPassword, setCompanyPassword] = useState('')
  const [driverPhone, setDriverPhone] = useState('')

  const handleCompanyLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.companyLogin({ email: companyEmail, password: companyPassword })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('company_id', res.data.company_id)
      localStorage.setItem('company_name', res.data.company_name)
      localStorage.setItem('manager_name', res.data.manager_name)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.detail || 'E-posta veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  const handleDriverLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.driverLogin({ phone: driverPhone })
      // For simple MVP, store the vehicle and students in state/localstorage
      localStorage.setItem('driver_vehicle', JSON.stringify(res.data.vehicle))
      localStorage.setItem('driver_students', JSON.stringify(res.data.students))
      navigate('/driver/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Bu numaraya kayıtlı araç bulunamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-gray-900">
          Hesabınıza Giriş Yapın
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-gray-500">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            Hemen Şirketinizi Kaydedin
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-[2rem] sm:px-10 border border-gray-100 slide-up">
          
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => { setActiveTab('company'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black rounded-lg transition-all ${
                activeTab === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Yönetici
            </button>
            <button
              onClick={() => { setActiveTab('driver'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black rounded-lg transition-all ${
                activeTab === 'driver' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car className="h-4 w-4" />
              Şoför
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
              {error}
            </div>
          )}

          {/* Company Form */}
          {activeTab === 'company' && (
            <form className="space-y-6 animate-in fade-in" onSubmit={handleCompanyLogin}>
              <div>
                <label className="block text-sm font-bold text-gray-700">E-posta</label>
                <div className="mt-2">
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Şifre</label>
                <div className="mt-2">
                  <input
                    type="password"
                    required
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      Giriş Yap
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Driver Form */}
          {activeTab === 'driver' && (
            <form className="space-y-6 animate-in fade-in" onSubmit={handleDriverLogin}>
              <div>
                <label className="block text-sm font-bold text-gray-700">Cep Telefonu Numarası</label>
                <div className="mt-2">
                  <input
                    type="tel"
                    required
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-50 sm:text-sm font-semibold transition-all"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-green-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-green-600/30 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      Öğrenci Listeme Git
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
