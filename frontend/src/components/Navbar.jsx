import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = async () => {
    await logout();
    addToast('À bientôt !', 'info');
    navigate('/');
  };

  const navLinks = user ? [
    { to: '/', label: 'Accueil' },
    { to: '/reservation', label: 'Réserver' },
    { to: '/mes-reservations', label: 'Mes rendez-vous' },
  ] : [
    { to: '/', label: 'Accueil' },
  ];

  return (
    <>
      {/* Lien d'évitement RGAA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cream-900 focus:text-cream-100 focus:rounded-lg focus:text-sm focus:font-sans focus:outline-none"
      >
        Aller au contenu principal
      </a>
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-cream-100' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl">✦</span>
          <span className="font-serif text-xl font-light tracking-widest text-cream-800 group-hover:text-cream-900 transition-colors">
            Paula's Nails
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-sans font-medium tracking-wide transition-colors ${
                location.pathname === link.to
                  ? 'text-cream-800'
                  : 'text-cream-500 hover:text-cream-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-cream-500 font-sans">
                Bonjour, <span className="text-cream-700 font-medium">{user.name.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-2 px-4">
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link to="/connexion" className="btn-ghost text-sm">Connexion</Link>
              <Link to="/inscription" className="btn-primary text-sm py-2 px-5">S'inscrire</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-cream-600 hover:text-cream-900 transition-colors"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-t border-cream-100 px-6 py-4 flex flex-col gap-4 shadow-card" role="navigation" aria-label="Menu mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-sans text-cream-700 hover:text-cream-900 py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-cream-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <span className="text-xs text-cream-400 font-sans">{user.email}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm self-start">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn-ghost self-start text-sm">Connexion</Link>
                <Link to="/inscription" className="btn-primary self-start text-sm">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
