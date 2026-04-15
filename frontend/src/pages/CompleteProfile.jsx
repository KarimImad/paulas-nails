import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch('/api/auth/profile', { phone });
      setUser(res.data.user);
      addToast('Profil complété !', 'success');
      navigate('/bienvenue');
    } catch {
      addToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-nude-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center mb-8 group">
            <span className="font-serif text-xl font-light tracking-widest text-cream-700 group-hover:text-cream-900 transition-colors">
              Paula's Nails
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-light text-cream-900 mb-2">
            Bienvenue, {user?.name?.split(' ')[0]} !
          </h1>
          <p className="text-sm text-cream-400 font-sans">
            Un numéro de téléphone est requis pour finaliser votre inscription.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="input-field"
                autoFocus
                autoComplete="tel"
                required
              />
              <p className="text-xs text-cream-400 font-sans mt-1.5">
                Nécessaire pour vous contacter en cas de modification de votre rendez-vous.
              </p>
            </div>

            <button type="submit" disabled={loading || !phone.trim()} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enregistrement…
                </span>
              ) : 'Enregistrer et continuer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
