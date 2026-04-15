import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-cream-900 text-cream-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-lg font-light tracking-widest text-cream-100">Paula's Nails</span>
            </div>
            <p className="text-sm leading-relaxed text-cream-400">
              Institut spécialisé dans la pose d'ongles en gel, semi-permanent et nail art.
              L'élégance à chaque détail.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-sans font-medium uppercase tracking-widest text-cream-500 mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/reservation', label: 'Prendre rendez-vous' },
                { to: '/mes-reservations', label: 'Mes rendez-vous' },
                { to: '/inscription', label: 'Créer un compte' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-cream-400 hover:text-cream-200 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-sans font-medium uppercase tracking-widest text-cream-500 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-cream-400">
              <li>12 rue Vital Carles, Bordeaux 33000</li>
              <li>paulalafon@hotmail.fr</li>
              <li>+33 6 15 73 00 76</li>
              <li className="pt-2 text-cream-500">Lun–Sam · 9h – 19h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream-600 font-sans">
            © {new Date().getFullYear()} Paula's Nails. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/politique-confidentialite" className="text-xs text-cream-700 hover:text-cream-400 font-sans transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-xs text-cream-700 font-sans">Fait avec soin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
