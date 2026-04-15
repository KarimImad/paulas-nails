export default function Divider({ label = 'ou' }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-cream-100" />
      <span className="text-xs text-cream-400 font-sans">{label}</span>
      <div className="flex-1 h-px bg-cream-100" />
    </div>
  );
}
