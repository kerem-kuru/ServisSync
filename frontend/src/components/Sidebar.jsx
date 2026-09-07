import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bus,
  Users,
  CreditCard,
  Settings
} from 'lucide-react'
import SettingsPanel from './SettingsPanel'

const navItems = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, exact: true },
  { to: '/admin/vehicles', label: 'Servis Araçları', icon: Bus },
  { to: '/admin/students', label: 'Öğrenci Yönetimi', icon: Users },
  { to: '/admin/payments', label: 'Aidat & Finans', icon: CreditCard },
]

export default function Sidebar() {
  const location = useLocation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 flex flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-[88px] shrink-0 items-center gap-4 px-8 border-b border-gray-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-600/20">
          <Bus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Servis<span className="text-blue-600">Sync</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto">
        <p className="px-3 mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Ana Menü</p>
        
        {navItems.map((item) => {
          const { to, label, icon: Icon, exact } = item
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              className={`
                group flex items-center gap-4 rounded-xl px-4 py-3.5
                text-[15px] font-bold transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`h-[22px] w-[22px] transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="flex-1">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Settings Link */}
      <div className="p-5 shrink-0 border-t border-gray-100">
        <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full group flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <Settings className="h-[22px] w-[22px] text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
          <span>Ayarlar</span>
        </button>
      </div>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  )
}
