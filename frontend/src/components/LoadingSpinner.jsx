export default function LoadingSpinner({ message = 'Chargement…', fullPage = false }) {
  const wrapper = fullPage
    ? 'min-h-screen pt-24 flex items-center justify-center'
    : 'flex items-center justify-center p-8 min-h-64';

  return (
    <div className={wrapper}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
        {message && <p className="text-cream-400 text-sm font-sans">{message}</p>}
      </div>
    </div>
  );
}
