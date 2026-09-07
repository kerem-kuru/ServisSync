import { useEffect, useState } from 'react'
import {
  Bus,
  Plus,
  Phone,
  User,
  Users,
  Loader2,
  Edit2,
} from 'lucide-react'
import Modal from '../components/Modal'
import { vehicleApi } from '../services/api'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    plate_number: '',
    driver_name: '',
    driver_phone: '',
  })
  const [editingId, setEditingId] = useState(null)

  const fetchVehicles = async () => {
    try {
      const res = await vehicleApi.list()
      setVehicles(res.data.results || res.data || [])
    } catch (err) {
      console.error('Araçlar yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await vehicleApi.update(editingId, form)
      } else {
        await vehicleApi.create(form)
      }
      setShowModal(false)
      setForm({ plate_number: '', driver_name: '', driver_phone: '' })
      setEditingId(null)
      fetchVehicles()
    } catch (err) {
      console.error('Araç kaydedilemedi:', err)
      alert('Araç kaydedilirken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (vehicle) => {
    setForm({
      plate_number: vehicle.plate_number,
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || ''
    })
    setEditingId(vehicle.id)
    setShowModal(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-8 fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Servis Araçları
          </h1>
          <p className="mt-1 text-base text-slate-500 font-medium">
            Filodaki tüm araçları ve kapasitelerini yönetin
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ plate_number: '', driver_name: '', driver_phone: '' })
            setEditingId(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Yeni Araç Ekle
        </button>
      </div>

      {/* Vehicle Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-32 text-center bg-slate-50/50">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 mb-6 border border-slate-200">
            <Bus className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Henüz araç eklenmemiş</h3>
          <p className="mt-2 text-base text-slate-500">
            İlk aracınızı ekleyerek filo yönetimine başlayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle, i) => (
            <div
              key={vehicle.id}
              className="glass-card p-6 slide-up hover:border-brand-primary transition-colors cursor-default"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-primary border border-blue-100">
                  <Bus className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="inline-block rounded-md bg-slate-100 px-3 py-1 text-lg font-black text-slate-900 tracking-wider border border-slate-200">
                    {vehicle.plate_number}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-primary"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <User className="h-4 w-4" />
                    <span>Sürücü</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {vehicle.driver_name || 'Atanmadı'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Phone className="h-4 w-4" />
                    <span>Telefon</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {vehicle.driver_phone || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>Öğrenci</span>
                  </div>
                  <span className="inline-flex rounded-lg bg-green-100 px-3 py-1 text-sm font-black text-green-700">
                    {vehicle.student_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingId(null)
        }}
        title={editingId ? "Araç Bilgilerini Düzenle" : "Yeni Araç Ekle"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Plaka
            </label>
            <input
              type="text"
              name="plate_number"
              value={form.plate_number}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Sürücü Adı
            </label>
            <input
              type="text"
              name="driver_name"
              value={form.driver_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Sürücü Telefonu
            </label>
            <input
              type="text"
              name="driver_phone"
              value={form.driver_phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Ekleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
