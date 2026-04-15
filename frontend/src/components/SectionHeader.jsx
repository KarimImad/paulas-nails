export default function SectionHeader({ supertitle, title, className = '' }) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {supertitle && (
        <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-3">
          {supertitle}
        </p>
      )}
      <h2 className="section-title">{title}</h2>
    </div>
  );
}
