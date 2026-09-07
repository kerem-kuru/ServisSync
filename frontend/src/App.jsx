import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import OverviewPage from './pages/OverviewPage'
import VehiclesPage from './pages/VehiclesPage'
import StudentsPage from './pages/StudentsPage'
import PaymentsPage from './pages/PaymentsPage'

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard'

// Auth Pages
import Register from './pages/Register'
import Login from './pages/Login'

import PWABanner from './components/PWABanner'

function AdminLayout() {
  return (
    <div className="min-h-screen bg-dash-bg text-brand-secondary font-sans">
      <Sidebar />
      
      {/* Main Layout wrapper matching sidebar width (288px = w-72) */}
      <div className="flex flex-col min-h-screen" style={{ marginLeft: '288px', width: 'calc(100% - 288px)' }}>
        <Topbar />
        
        {/* Main Content Area - Full width, no max-w restrictions */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden w-full">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function DriverLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans w-full max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      <PWABanner />
      <Outlet />
    </div>
  )
}

import LandingPage from './pages/landing/LandingPage'

export default function App() {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Panel Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>

      {/* Mobile Driver Routes */}
      <Route path="/driver" element={<DriverLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboard />} />
      </Route>
    </Routes>
  )
}
