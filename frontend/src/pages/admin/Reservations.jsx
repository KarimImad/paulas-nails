import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import SkeletonCard from '../../components/SkeletonCard';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}


const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function AdminReservations() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/reservations');
      setReservations(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await axios.patch(`/api/reservations/${id}/status`, { status });
      addToast('Statut mis à jour.', 'success');
      fetchReservations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = reservations.filter(r => {
    const matchStatus = !filterStatus || r.status === filterStatus;
    const q = filterSearch.toLowerCase();
    const matchSearch = !q || r.user_name?.toLowerCase().includes(q) || r.service_name?.toLowerCase().includes(q) || r.user_email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-light text-cream-900">Réservations</h1>
        <p className="text-sm text-cream-400 font-sans mt-1">{counts.total} réservation(s) au total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Confirmées', count: counts.confirmed, cls: 'badge-confirmed' },
          { label: 'Annulées', count: counts.cancelled, cls: 'badge-cancelled' },
        ].map(({ label, count, cls }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-serif text-cream-900 mb-1">{count}</p>
            <span className={cls}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Rechercher par client, prestation…"
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field sm:max-w-xs"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-cream-400 font-sans">Aucune réservation trouvée.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-cream-50 border-b border-cream-100 text-xs font-sans font-medium uppercase tracking-wider text-cream-400">
            <div className="col-span-3">Cliente</div>
            <div className="col-span-3">Prestation</div>
            <div className="col-span-2">Date & heure</div>
            <div className="col-span-1">Prix</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-1" />
          </div>

          <div className="divide-y divide-cream-50">
            {filtered.map(r => (
              <div key={r.id} className="px-6 py-4 hover:bg-cream-50/50 transition-colors">
                <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-3">
                  <div className="col-span-3">
                    <p className="text-sm font-sans font-medium text-cream-800">{r.user_name}</p>
                    <p className="text-xs text-cream-400 font-sans truncate">{r.user_email}</p>
                    {r.user_phone && <p className="text-xs text-cream-400 font-sans">{r.user_phone}</p>}
                  </div>

                  <div className="col-span-3">
                    <p className="text-sm font-sans text-cream-700">{r.service_name}</p>
                    <p className="text-xs text-cream-400 font-sans">{r.service_duration} min</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-sans text-cream-700 capitalize">{formatDate(r.slot_date)}</p>
                    <p className="text-xs text-cream-400 font-sans">{r.slot_time?.slice(0, 5)}</p>
                  </div>

                  <div className="col-span-1">
                    <p className="text-sm font-sans font-medium text-cream-700">{r.service_price}€</p>
                  </div>

                  <div className="col-span-2">
                    <StatusBadge status={r.status} />
                    {r.notes && (
                      <p className="text-xs text-cream-400 font-sans mt-1 italic truncate max-w-[150px]" title={r.notes}>
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 flex items-center gap-1">
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'cancelled')}
                        disabled={updating === r.id}
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        title="Annuler"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {r.status === 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'confirmed')}
                        disabled={updating === r.id}
                        className="p-1.5 rounded-lg bg-cream-50 text-cream-500 hover:bg-cream-100 transition-colors text-xs font-sans"
                        title="Rétablir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
