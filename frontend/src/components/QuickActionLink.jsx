import { Link } from 'react-router-dom';

export default function QuickActionLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center group-hover:bg-cream-200 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-sans text-cream-700">{label}</span>
    </Link>
  );
}
