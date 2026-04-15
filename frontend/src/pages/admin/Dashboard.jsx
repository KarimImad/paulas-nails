import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import QuickActionLink from '../../components/QuickActionLink';


function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, s, sl, u] = await Promise.all([
          axios.get('/api/reservations'),
          axios.get('/api/services'),
          axios.get('/api/slots'),
          axios.get('/api/auth/users/count'),
        ]);
        setReservations(r.data);
        setServices(s.data);
        setSlots(sl.data);
        setClientCount(u.data.count);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.slot_date === today && r.status !== 'cancelled');
  const weekCount = reservations.filter(r => r.slot_date >= today && r.slot_date <= in7days && r.status !== 'cancelled').length;
  const availableSlotsCount = slots.filter(s => s.is_available && !s.reservation_id).length;

  const upcoming = reservations
    .filter(r => r.status !== 'cancelled')
    .sort((a, b) => a.slot_date.localeCompare(b.slot_date) || a.slot_time.localeCompare(b.slot_time))
    .slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-light text-cream-900">
          Bonjour, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-cream-400 font-sans mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Aujourd'hui"
          value={todayReservations.length}
          sub="rendez-vous du jour"
          color="bg-amber-50"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard
          label="Cette semaine"
          value={weekCount}
          sub="rendez-vous à venir"
          color="bg-violet-50"
          icon={<svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Clientes"
          value={clientCount}
          sub="inscrites"
          color="bg-pink-50"
          icon={<svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Créneaux libres"
          value={availableSlotsCount}
          sub="disponibles"
          color="bg-cream-100"
          icon={<svg className="w-5 h-5 text-cream-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-50 flex items-center justify-between">
              <h2 className="font-sans font-medium text-cream-800 text-sm">Prochains rendez-vous</h2>
              <Link to="/admin/reservations" className="text-xs font-sans text-cream-400 hover:text-cream-700 transition-colors">
                Voir tout →
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-cream-400 font-sans text-sm">Aucun rendez-vous à venir</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-50">
                {upcoming.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-cream-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center text-sm shrink-0">
                        💅
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-sans font-medium text-cream-800 truncate">{r.user_name}</p>
                        <p className="text-xs text-cream-400 font-sans truncate">{r.service_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-sans font-medium text-cream-700 capitalize">{formatDate(r.slot_date)}</p>
                      <p className="text-xs text-cream-400 font-sans">{r.slot_time?.slice(0, 5)}</p>
                    </div>
                    <span className="shrink-0 badge-confirmed">Confirmé</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-sans font-medium text-cream-800 text-sm mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <QuickActionLink to="/admin/creneaux" label="Ajouter des créneaux" icon={
                <svg className="w-4 h-4 text-cream-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              } />
              <QuickActionLink to="/admin/services" label="Gérer les prestations" icon={
                <svg className="w-4 h-4 text-cream-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              } />
              <QuickActionLink to="/admin/reservations" label="Toutes les réservations" icon={
                <svg className="w-4 h-4 text-cream-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              } />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-sans font-medium text-cream-800 text-sm mb-3">Catalogue</h2>
            <p className="text-3xl font-serif text-cream-900 mb-1">{services.length}</p>
            <p className="text-xs font-sans text-cream-400">prestations disponibles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
