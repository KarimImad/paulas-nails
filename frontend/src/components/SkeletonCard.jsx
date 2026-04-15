export default function SkeletonCard({ lines = 4 }) {
  const widths = ['w-20', 'w-3/4', 'w-full', 'w-2/3', 'w-1/2'];

  return (
    <div className="card p-6 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-cream-100 rounded-full ${widths[i % widths.length]} ${i === 0 ? 'mb-4' : 'mb-2'}`}
        />
      ))}
    </div>
  );
}
