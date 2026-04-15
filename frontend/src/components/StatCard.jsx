export default function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-serif text-cream-900 mb-1">{value}</p>
      <p className="text-sm font-sans font-medium text-cream-700">{label}</p>
      {sub && <p className="text-xs font-sans text-cream-400 mt-1">{sub}</p>}
    </div>
  );
}
