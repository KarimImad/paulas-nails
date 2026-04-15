import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
} 


export default function Welcome() {
  const { user } = useAuth();
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNext = async () => {
      try {
        const res = await axios.get('/api/reservations/my');
        const upcoming = res.data
          .filter(r => r.status !== 'cancelled' && new Date(`${r.slot_date}T${r.slot_time}`) > new Date())
          .sort((a, b) => new Date(`${a.slot_date}T${a.slot_time}`) - new Date(`${b.slot_date}T${b.slot_time}`));
        setNext(upcoming[0] || null);
      } catch {
        setNext(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNext();
  }, []);

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-nude-50 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-2">
            Bonjour
          </p>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-cream-900 leading-tight">
            {firstName}
          </h1>
          <p className="text-cream-400 font-sans mt-3 text-lg font-light">
            Que souhaitez-vous faire aujourd'hui ?
          </p>
        </div>

        {!loading && (
          <div className={`card p-6 mb-8 ${next ? 'border-cream-200' : 'border-dashed border-cream-200'}`}>
            {next ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-1">
                    Prochain rendez-vous
                  </p>
                  <p className="text-xl font-serif font-light text-cream-900">{next.service_name}</p>
                  <p className="text-sm font-sans text-cream-500 mt-1">
                    {formatDate(next.slot_date)} · {next.slot_time.slice(0, 5)}
                  </p>
                </div>
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl">
                  💅
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-1">
                    Aucun rendez-vous à venir
                  </p>
                  <p className="text-cream-600 font-sans text-sm">Prenez soin de vous, réservez dès maintenant.</p>
                </div>
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl">
                  🗓️
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/reservation"
            className="card p-6 hover:shadow-hover transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-900 flex items-center justify-center text-cream-100 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg text-cream-900">Réserver</p>
              <p className="text-xs font-sans text-cream-400 mt-0.5">Choisir une prestation</p>
            </div>
          </Link>

          <Link
            to="/mes-reservations"
            className="card p-6 hover:shadow-hover transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-cream-700 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg text-cream-900">Mes rendez-vous</p>
              <p className="text-xs font-sans text-cream-400 mt-0.5">Voir l'historique</p>
            </div>
          </Link>

          <Link
            to="/"
            className="card p-6 hover:shadow-hover transition-all duration-300 group flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-cream-700 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg text-cream-900">Accueil</p>
              <p className="text-xs font-sans text-cream-400 mt-0.5">Voir nos prestations</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
