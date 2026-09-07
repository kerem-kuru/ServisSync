import { useState, useRef } from 'react'
import { FileUp, Sparkles, Loader2, X, AlertCircle } from 'lucide-react'
import { studentApi } from '../services/api'
import Modal from './Modal'

export default function ExcelImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Lütfen bir Excel veya CSV dosyası seçin.')
      return
    }

    setIsAnalyzing(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await studentApi.aiImport(formData)
      setPreviewData(res.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Dosya analiz edilirken bir hata oluştu.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFieldChange = (index, field, value) => {
    const newData = [...previewData]
    newData[index][field] = value
    setPreviewData(newData)
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    setError('')
    try {
      const res = await studentApi.aiConfirmImport(previewData)
      if (onImportSuccess) {
        onImportSuccess(res.data.detail)
      }
      handleClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'İçe aktarım sırasında bir hata oluştu.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData(null)
    setError('')
    setIsAnalyzing(false)
    setIsConfirming(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yapay Zeka ile Otomatik Aktarım" maxWidth="max-w-5xl">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {!previewData && !isAnalyzing && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-black text-slate-900">Karmaşık Excel dosyalarınızı saniyeler içinde ayrıştırın.</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500 max-w-lg mx-auto">
              Ad-Soyad sütunları bitişik olsa, numaralar bozuk olsa dahi Yapay Zeka anlar, düzenler ve sisteme tertemiz kaydeder.
            </p>
            
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors"
            >
              <FileUp className="h-5 w-5" />
              {file ? file.name : 'Excel / CSV Dosyası Seç'}
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={handleClose} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
              İptal
            </button>
            <button 
              onClick={handleAnalyze} 
              disabled={!file}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Sparkles className="h-4 w-4" />
              Sihirli Ayrıştırıcıyı Başlat
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30">
               <Sparkles className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900">Yapay Zeka Listenizi Analiz Ediyor...</h3>
          <p className="mt-2 text-sm font-bold text-slate-500 animate-pulse">
            İsimler ayrıştırılıyor, telefon numaraları düzenleniyor...
          </p>
        </div>
      )}

      {previewData && !isAnalyzing && (
        <div className="space-y-6">
          <div className="rounded-xl bg-green-50 p-4 border border-green-100">
            <h3 className="text-sm font-black text-green-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 
              {previewData.length} Kayıt Başarıyla Ayrıştırıldı
            </h3>
            <p className="text-xs font-bold text-green-600 mt-1">Eğer hatalı ayrıştırılan bir satır varsa, aşağıdaki tabloda hücreye tıklayarak düzeltebilirsiniz.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-3 border-b">Ad</th>
                  <th className="px-4 py-3 border-b">Soyad</th>
                  <th className="px-4 py-3 border-b">Veli Adı</th>
                  <th className="px-4 py-3 border-b">Veli Telefonu</th>
                  <th className="px-4 py-3 border-b">Araç/Plaka</th>
                  <th className="px-4 py-3 border-b text-right">Toplam Tutar</th>
                  <th className="px-4 py-3 border-b text-right">Taksit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-2"><input value={row.first_name} onChange={(e) => handleFieldChange(i, 'first_name', e.target.value)} className="w-full rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2"><input value={row.last_name} onChange={(e) => handleFieldChange(i, 'last_name', e.target.value)} className="w-full rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2"><input value={row.parent_name} onChange={(e) => handleFieldChange(i, 'parent_name', e.target.value)} className="w-full rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2"><input value={row.parent_phone} onChange={(e) => handleFieldChange(i, 'parent_phone', e.target.value)} className="w-full rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2"><input value={row.plate_number} onChange={(e) => handleFieldChange(i, 'plate_number', e.target.value)} className="w-full rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2 text-right"><input type="number" value={row.total_agreed_fee} onChange={(e) => handleFieldChange(i, 'total_agreed_fee', e.target.value)} className="w-full text-right rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                    <td className="p-2 text-right"><input type="number" value={row.installment_count} onChange={(e) => handleFieldChange(i, 'installment_count', e.target.value)} className="w-16 text-right rounded bg-transparent px-2 py-1 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={() => setPreviewData(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">
              Geri Dön
            </button>
            <div className="flex gap-3">
              <button onClick={handleClose} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                İptal
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-500/30 hover:bg-green-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isConfirming ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sisteme Aktar ve Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
