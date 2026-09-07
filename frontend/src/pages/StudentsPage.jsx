import { useEffect, useState } from 'react'
import {
  GraduationCap,
  Plus,
  Phone,
  User,
  Loader2,
  Search,
  Sparkles,
  Edit2,
} from 'lucide-react'
import Modal from '../components/Modal'
import ExcelImportModal from '../components/ExcelImportModal'
import { studentApi, vehicleApi } from '../services/api'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    parent_name: '',
    parent_phone: '',
    pickup_address: '',
    installment_count: '9',
    vehicle: '',
  })
  const [editingId, setEditingId] = useState(null)

  const fetchData = async () => {
    try {
      const [studentsRes, vehiclesRes] = await Promise.all([
        studentApi.list(),
        vehicleApi.list(),
      ])
      setStudents(studentsRes.data.results || studentsRes.data || [])
      setVehicles(vehiclesRes.data.results || vehiclesRes.data || [])
    } catch (err) {
      console.error('Veri yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (payload.total_agreed_fee) payload.total_agreed_fee = parseFloat(payload.total_agreed_fee)
      if (payload.installment_count) payload.installment_count = parseInt(payload.installment_count, 10)
      if (editingId) {
        await studentApi.update(editingId, payload)
      } else {
        await studentApi.create(payload)
      }
      setShowModal(false)
      setForm({
        first_name: '',
        last_name: '',
        parent_name: '',
        parent_phone: '',
        pickup_address: '',
        total_agreed_fee: '',
        installment_count: '9',
        vehicle: '',
      })
      setEditingId(null)
      fetchData()
    } catch (err) {
      console.error('Öğrenci kaydedilemedi:', err)
      alert('Öğrenci kaydedilirken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (student) => {
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      pickup_address: student.pickup_address || '',
      total_agreed_fee: student.total_agreed_fee || '',
      installment_count: student.installment_count || '9',
      vehicle: student.vehicle || '',
    })
    setEditingId(student.id)
    setShowModal(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAssignVehicle = async (studentId, vehicleId) => {
    try {
      await studentApi.assignVehicle(studentId, vehicleId)
      fetchData()
    } catch (err) {
      console.error('Araç atanamadı:', err)
      alert('Araç atanırken bir hata oluştu.')
    }
  }

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(q))
    )
  })

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100'

  return (
    <div className="space-y-8 fade-in w-full">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Öğrenci Yönetimi
          </h1>
          <p className="mt-1 text-base text-slate-500 font-medium">
            Tüm öğrencilerin atamalarını ve kayıtlarını yapın
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, Soyad, Veli..."
              className="w-72 rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100 shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="h-5 w-5" />
            Yapay Zeka ile İçe Aktar
          </button>

          <button
            onClick={() => {
              setForm({
                first_name: '',
                last_name: '',
                parent_name: '',
                parent_phone: '',
                pickup_address: '',
                total_agreed_fee: '',
                installment_count: '9',
                vehicle: '',
              })
              setEditingId(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Yeni Kayıt
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-32 text-center bg-slate-50/50">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 mb-6 border border-slate-200">
            <GraduationCap className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Öğrenci Kaydı Bulunamadı</h3>
          <p className="mt-2 text-base text-slate-500">
            Sisteme ilk öğrenci kaydınızı ekleyerek başlayın.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-dash-border text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Öğrenci Profili</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Veli Bilgisi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">İletişim</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Servis Aracı</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aidat Tutarı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border">
                {filteredStudents.map((student, i) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl font-black text-purple-600 border border-purple-100">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-slate-500 font-medium mt-0.5">{student.pickup_address || 'Adres Yok'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-base font-semibold text-slate-700">
                        <User className="h-4 w-4 text-slate-400" />
                        {student.parent_name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-base font-semibold text-slate-700">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {student.parent_phone || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={student.vehicle || ''}
                        onChange={(e) => handleAssignVehicle(student.id, e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-100 cursor-pointer w-48 shadow-sm"
                      >
                        <option value="">Atama Yapılmadı</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>{v.plate_number}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end">
                          <span className="inline-flex rounded-lg bg-green-100 px-3 py-1.5 text-sm font-black text-green-700 border border-green-200">
                            ₺{Number(student.total_agreed_fee).toLocaleString('tr-TR')}
                          </span>
                          <span className="text-xs font-bold text-slate-500 mt-1">
                            {student.installment_count} Taksit
                          </span>
                        </div>
                        <button
                          onClick={() => handleEdit(student)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-primary"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && search && (
            <div className="py-12 text-center text-base font-bold text-slate-500 bg-slate-50">
              "{search}" ile eşleşen sonuç bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingId(null)
        }}
        title={editingId ? "Öğrenci Bilgilerini Düzenle" : "Yeni Öğrenci Ekle"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Ad</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Soyad</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Veli Adı</label>
              <input type="text" name="parent_name" value={form.parent_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Veli Telefonu</label>
              <input type="text" name="parent_phone" value={form.parent_phone} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Adres</label>
            <input type="text" name="pickup_address" value={form.pickup_address} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Toplam Tutar (₺)</label>
              <input type="number" name="total_agreed_fee" value={form.total_agreed_fee} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Taksit (Ay)</label>
              <input type="number" name="installment_count" value={form.installment_count} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Servis Aracı</label>
              <select name="vehicle" value={form.vehicle} onChange={handleChange} className={inputClass + ' cursor-pointer bg-white'}>
                <option value="">Atama yapma</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plate_number}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              İptal
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Ekleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Import Modal */}
      <ExcelImportModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onImportSuccess={(msg) => {
          alert(msg)
          fetchData()
        }}
      />
    </div>
  )
}
