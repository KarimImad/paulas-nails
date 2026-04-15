export default function EmptyState({ icon = '', title, description, action }) {
  return (
    <div className="card p-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      {title && <h2 className="text-2xl font-serif text-cream-700 mb-3">{title}</h2>}
      {description && <p className="text-cream-400 font-sans mb-8">{description}</p>}
      {action}
    </div>
  );
}
