import { useEffect, useState } from 'react'
import {
  CreditCard,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  BellRing,
  X,
  Loader2
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { studentApi, paymentApi, notificationApi } from '../services/api'

// Simple Toast Component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl fade-in slide-up text-sm font-bold text-white
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      {message}
    </div>
  )
}

export default function PaymentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [submitting, setSubmitting] = useState(false)
  const [reminding, setReminding] = useState(false)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await studentApi.list()
      // Django pagination response formats check
      setStudents(res.data.results || res.data)
    } catch (err) {
      console.error('Veriler alınamadı:', err)
      showToast('Veriler yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Calculate totals
  const totalAgreed = students.reduce((acc, curr) => acc + parseFloat(curr.total_agreed_fee || 0), 0)
  const totalPaid = students.reduce((acc, curr) => acc + parseFloat(curr.total_paid || 0), 0)
  const totalDebt = students.reduce((acc, curr) => acc + parseFloat(curr.remaining_debt || 0), 0)

  // Handlers
  const handleApproveInstallment = async (paymentId) => {
    setSubmitting(true)
    try {
      await paymentApi.approveInstallment(paymentId, paymentMethod)
      showToast('Taksit başarıyla tahsil edildi.')
      
      // Update local modal state
      setSelectedStudent(prev => {
        if (!prev) return prev
        const updatedPayments = prev.payments.map(p => 
          p.id === paymentId ? { ...p, status: 'paid', paid_at: new Date().toISOString(), payment_method: paymentMethod } : p
        )
        // Find the amount we just paid
        const paidAmount = parseFloat(prev.payments.find(p => p.id === paymentId)?.amount || 0)
        
        return {
          ...prev,
          payments: updatedPayments,
          remaining_debt: parseFloat(prev.remaining_debt) - paidAmount,
          total_paid: parseFloat(prev.total_paid) + paidAmount
        }
      })
      
      fetchStudents()
    } catch (err) {
      console.error(err)
      showToast('Tahsilat işlemi başarısız', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReminder = async (studentId = null) => {
    setReminding(true)
    try {
      if (studentId) {
        await notificationApi.sendReminder({ student_id: studentId })
        showToast('Hatırlatma mesajı gönderildi.')
      } else {
        const confirmBulk = window.confirm("Borcu olan tüm velilere hatırlatma mesajı gönderilecek. Onaylıyor musunuz?")
        if (!confirmBulk) return
        
        const res = await notificationApi.sendReminder({ bulk: true })
        showToast(res.data.detail)
      }
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.detail || 'Hatırlatma gönderilemedi', 'error')
    } finally {
      setReminding(false)
    }
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Oto-Tahsilat Motoru
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Tüm öğrencilerin sezonluk borç ve ödeme durumlarını takip edin.
          </p>
        </div>
        <button 
          onClick={() => handleSendReminder()}
          disabled={reminding || totalDebt <= 0}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-[14px] font-black text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50"
        >
          {reminding ? <Loader2 className="h-5 w-5 animate-spin" /> : <BellRing className="h-5 w-5" />}
          Tüm Gecikenlere Hatırlatma At
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          icon={CreditCard}
          label="Sezonluk Toplam Alacak"
          value={`₺${totalAgreed.toLocaleString('tr-TR')}`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Kasa Girişi (Tahsil Edilen)"
          value={`₺${totalPaid.toLocaleString('tr-TR')}`}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Geciken / Kalan Borç"
          value={`₺${totalDebt.toLocaleString('tr-TR')}`}
          color="red"
        />
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
          <h2 className="text-[17px] font-black text-gray-900">
            Öğrenci Tahsilat Durumları
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400">Öğrenci & Veli</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400">Anlaşılan</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400">Ödenen</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400">Kalan Borç</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-300" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center font-bold text-gray-400">
                    Öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const debt = parseFloat(student.remaining_debt || 0)
                  const hasDebt = debt > 0

                  return (
                    <tr key={student.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-5">
                        <div className="text-[15px] font-black text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-gray-500">
                          <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                          {student.parent_phone || 'Tel Yok'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[15px] font-bold text-gray-600">
                        <div className="flex flex-col">
                          <span>₺{parseFloat(student.total_agreed_fee || 0).toLocaleString('tr-TR')}</span>
                          <span className="text-[12px] font-semibold text-gray-400">{student.installment_count} Taksit</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[15px] font-bold text-green-600">
                        ₺{parseFloat(student.total_paid || 0).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-black ${hasDebt ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                          {hasDebt ? `₺${debt.toLocaleString('tr-TR')}` : 'Borç Yok'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition-all hover:bg-blue-100"
                        >
                          Taksitleri Gör
                        </button>
                        {hasDebt && (
                          <button
                            onClick={() => handleSendReminder(student.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-green-600"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Hatırlat
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 fade-in">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Taksit Planı</h3>
                <p className="text-sm font-bold text-gray-500 mt-1">{selectedStudent.first_name} {selectedStudent.last_name}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 p-4 border border-blue-100 shrink-0">
              <div>
                <p className="text-[12px] font-bold text-blue-800 uppercase tracking-wider">Kalan Borç</p>
                <p className="text-lg font-black text-red-600 mt-0.5">₺{parseFloat(selectedStudent.remaining_debt || 0).toLocaleString('tr-TR')}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-bold text-blue-800 uppercase tracking-wider">Tahsil Edilen Yöntem</p>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-bold text-blue-900 outline-none focus:border-blue-500"
                >
                  <option value="cash">Nakit</option>
                  <option value="transfer">Havale / EFT</option>
                  <option value="card">Kredi Kartı</option>
                </select>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
              {(!selectedStudent.payments || selectedStudent.payments.length === 0) ? (
                <div className="text-center py-10 text-gray-400 font-bold">Ödeme planı bulunamadı.</div>
              ) : (
                selectedStudent.payments.map((payment) => {
                  const isPaid = payment.status === 'paid'
                  return (
                    <div key={payment.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${isPaid ? 'border-green-100 bg-green-50/50' : 'border-gray-100 bg-white'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${isPaid ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {payment.installment_number}
                          </span>
                          <span className="text-[16px] font-black text-gray-900">
                            ₺{parseFloat(payment.amount).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        {isPaid && (
                          <div className="mt-1.5 flex items-center gap-1 text-[12px] font-bold text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {new Date(payment.paid_at).toLocaleDateString('tr-TR')} tarihinde ödendi
                          </div>
                        )}
                      </div>
                      
                      {!isPaid && (
                        <button
                          onClick={() => handleApproveInstallment(payment.id)}
                          disabled={submitting}
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                        >
                          Tahsil Et
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
