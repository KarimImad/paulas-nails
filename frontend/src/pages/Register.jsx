import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [rgpd, setRgpd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

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
      navigate('/reservation');
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
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <span className="text-2xl text-cream-600">✦</span>
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
          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-sans">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

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
              <label htmlFor="phone" className="label">Téléphone <span className="text-cream-300 normal-case tracking-normal">(optionnel)</span></label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="input-field"
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

            {/* Case RGPD */}
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création du compte…
                </span>
              ) : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-cream-400 font-sans mt-6 leading-relaxed">
          En créant un compte, vous acceptez nos conditions d'utilisation<br />et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
