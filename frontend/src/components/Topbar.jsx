import { Search, User as UserIcon } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[88px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 lg:px-12">
      {/* Search Bar - Large, Clean */}
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Öğrenci, araç veya veli ara..."
          className="h-12 w-full rounded-2xl border-none bg-gray-100 pl-12 pr-4 text-[15px] font-medium text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-md"
        />
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[15px] font-bold text-gray-900">{localStorage.getItem('manager_name') || 'Yönetici Hesabı'}</span>
            <span className="text-[13px] font-semibold text-gray-500 mt-0.5">{localStorage.getItem('company_name') || 'Şirket Yükleniyor...'}</span>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            title="Çıkış Yap"
            className="flex h-12 w-12 overflow-hidden rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 items-center justify-center text-red-600 transition-colors"
          >
             <UserIcon className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  )
}
