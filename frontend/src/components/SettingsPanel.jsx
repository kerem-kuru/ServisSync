import { useState } from 'react'
import { X, Crown, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { authApi } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function SettingsPanel({ isOpen, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const navigate = useNavigate()

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    try {
      setIsDeleting(true)
      await authApi.deleteCompany()
      // Temizlik ve çıkış
      localStorage.clear()
      window.location.href = '/login'
    } catch (error) {
      console.error("Hesap silinirken hata oluştu:", error)
      alert("Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.")
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Ayarlar</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Upgrade Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Crown className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-300" />
                <span className="font-bold text-lg tracking-wide">Pro'ya Geç</span>
              </div>
              <p className="text-indigo-100 text-sm mb-5 leading-relaxed">
                Tüm sınırları kaldırın, gelişmiş raporlama ve özel müşteri desteği ile işinizi büyütün.
              </p>
              
              <button className="w-full py-2.5 px-4 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                Sürümü Yükselt
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Hesap Bilgileri</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
               <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Şirket Adı</span>
                  <span className="text-sm font-semibold text-gray-900">{localStorage.getItem('company_name') || '-'}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Yönetici</span>
                  <span className="text-sm font-semibold text-gray-900">{localStorage.getItem('manager_name') || '-'}</span>
               </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Tehlikeli Bölge
            </h3>
            
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
              <h4 className="text-base font-bold text-red-900 mb-2">Hesabı Sil</h4>
              <p className="text-sm text-red-700/80 mb-4">
                Hesabınızı sildiğinizde, şirketinize ait tüm araç, öğrenci, ödeme ve yoklama verileri kalıcı olarak silinir. Bu işlem geri alınamaz.
              </p>

              {confirmDelete ? (
                <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                  <p className="text-sm font-bold text-red-600">Bu işlemi onaylıyor musunuz?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      className="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 py-2 px-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hesabımı Kalıcı Olarak Sil
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}
