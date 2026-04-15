export function Button({ loading, loadingText = 'Chargement…', children = 'Se connecter', className = 'btn-primary w-full py-3.5 mt-2', type = 'submit' }) {
  return (
    <button type={type} disabled={loading} className={className}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingText}
        </span>
      ) : children}
    </button>
  );
}
