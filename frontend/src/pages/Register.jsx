import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import { authApi } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    manager_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.password_confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const { password_confirm, ...dataToSubmit } = formData
      const res = await authApi.registerCompany(dataToSubmit)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('company_id', res.data.company_id)
      localStorage.setItem('company_name', res.data.company_name)
      localStorage.setItem('manager_name', res.data.manager_name)
      navigate('/admin') // Admin paneline yönlendir
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-gray-900">
          ServisSync'e Katılın
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-gray-500">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Giriş Yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-[2rem] sm:px-10 border border-gray-100 slide-up">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700">Şirket Adı</label>
                <div className="mt-2">
                  <input
                    name="company_name"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                    placeholder="Servis A.Ş."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Yetkili Ad Soyad</label>
                <div className="mt-2">
                  <input
                    name="manager_name"
                    type="text"
                    required
                    value={formData.manager_name}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">E-posta</label>
                <div className="mt-2">
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Telefon Numarası</label>
                <div className="mt-2">
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                    placeholder="0532 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Şifre</label>
                <div className="mt-2">
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Şifre Tekrar</label>
                <div className="mt-2">
                  <input
                    name="password_confirm"
                    type="password"
                    required
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 sm:text-sm font-semibold transition-all"
                  />
                </div>
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
                    Hemen Başla
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
