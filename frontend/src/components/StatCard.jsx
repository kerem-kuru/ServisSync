export default function StatCard({ icon: Icon, label, value, sublabel, color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    slate: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  }

  const styles = colorMap[color] || colorMap.blue

  return (
    <div className="glass-card p-7 flex flex-col justify-between group hover:border-gray-300 transition-colors cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div>
           <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">
             {label}
           </p>
           <p className="text-[40px] font-black text-gray-900 tracking-tight leading-none">
             {value}
           </p>
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.bg} ${styles.text} ${styles.border} border transition-transform group-hover:scale-110`}>
          <Icon className="h-7 w-7" strokeWidth={2.5} />
        </div>
      </div>
      
      {sublabel && (
        <div className="mt-4 flex items-center gap-2">
           <span className={`inline-flex h-2 w-2 rounded-full ${styles.bg.replace('50', '500')}`}></span>
           <p className="text-[13px] font-semibold text-gray-500">
             {sublabel}
           </p>
        </div>
      )}
    </div>
  )
}
