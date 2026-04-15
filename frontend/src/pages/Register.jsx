import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import ErrorAlert from '../components/ErrorAlert';
import Divider from '../components/Divider';

export default function Register() {
  const { register, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [rgpd, setRgpd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/bienvenue', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!rgpd) {
      setError('Vous devez accepter la politique de confidentialité pour créer un compte.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      addToast('Compte créé avec succès !', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-nude-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center mb-8 group">
            <span className="font-serif text-xl font-light tracking-widest text-cream-700 group-hover:text-cream-900 transition-colors">
              Paula's Nails
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-light text-cream-900 mb-2">Créer un compte</h1>
          <p className="text-sm text-cream-400 font-sans">
            Déjà inscrite ?{' '}
            <Link to="/connexion" className="text-cream-700 hover:text-cream-900 font-medium hover:underline underline-offset-2 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="card p-8">
          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulaire de création de compte" noValidate>
            <div>
              <label htmlFor="name" className="label">Prénom et nom</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Marie Dupont"
                className="input-field"
                required
                aria-required="true"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Adresse email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@email.com"
                className="input-field"
                required
                aria-required="true"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">Téléphone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="input-field"
                required
                aria-required="true"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  className="input-field pr-12"
                  required
                  aria-required="true"
                  autoComplete="new-password"
                  aria-describedby="pwd-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {form.password && (
                <div id="pwd-strength" className="mt-2" aria-live="polite" aria-label={`Force du mot de passe : ${strengthLabel[strength]}`}>
                  <div className="flex gap-1" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-cream-100'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-cream-400 mt-1 font-sans">{strengthLabel[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="label">Confirmer le mot de passe</label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-300 focus:ring-red-200' : ''}`}
                required
                aria-required="true"
                autoComplete="new-password"
                aria-invalid={form.confirm && form.confirm !== form.password ? 'true' : 'false'}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 mt-1.5 font-sans">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="rgpd"
                checked={rgpd}
                onChange={e => setRgpd(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-cream-700 cursor-pointer shrink-0"
                aria-required="true"
              />
              <label htmlFor="rgpd" className="text-xs text-cream-500 font-sans leading-relaxed cursor-pointer">
                J'ai lu et j'accepte la{' '}
                <Link to="/politique-confidentialite" target="_blank" className="text-cream-700 hover:text-cream-900 underline underline-offset-2">
                  politique de confidentialité
                </Link>{' '}
                et consens au traitement de mes données personnelles conformément au RGPD.
              </label>
            </div>

            <Button loading={loading} loadingText="Création du compte…">Créer mon compte</Button>
          </form>

          <Divider />

          <a
            href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-cream-200 rounded-xl bg-white hover:bg-cream-50 transition-colors text-sm font-sans font-medium text-cream-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            S'inscrire avec Google
          </a>
        </div>

        <p className="text-center text-xs text-cream-400 font-sans mt-6 leading-relaxed">
          En créant un compte, vous acceptez nos conditions d'utilisation<br />et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
