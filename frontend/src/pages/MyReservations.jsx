import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'En attente',  cls: 'badge-pending'   },
    confirmed: { label: 'Confirmé',    cls: 'badge-confirmed'  },
    cancelled: { label: 'Annulé',      cls: 'badge-cancelled'  },
  };
  const { label, cls } = map[status] || map.pending;
  return <span className={cls}>{label}</span>;
}

function isPast(dateStr, timeStr) {
  const dt = new Date(`${dateStr}T${timeStr}`);
  return dt < new Date();
}

export default function MyReservations() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchReservations = () => {
    setLoading(true);
    axios.get('/api/reservations/my')
      .then(res => setReservations(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReservations, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler ce rendez-vous ?')) return;
    setCancelling(id);
    try {
      await axios.patch(`/api/reservations/${id}/cancel`);
      addToast('Réservation annulée.', 'info');
      fetchReservations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de l\'annulation.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = reservations.filter(r => r.status !== 'cancelled' && !isPast(r.slot_date, r.slot_time));
  const past = reservations.filter(r => r.status === 'cancelled' || isPast(r.slot_date, r.slot_time));

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-2">Mon espace</p>
          <div className="flex items-center justify-between">
            <h1 className="page-header">Mes rendez-vous</h1>
            <Link to="/reservation" className="btn-primary text-sm py-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau RDV
            </Link>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-5">✦</div>
            <h2 className="text-2xl font-serif text-cream-700 mb-3">Aucune réservation</h2>
            <p className="text-cream-400 font-sans mb-8">Prenez votre premier rendez-vous dès maintenant.</p>
            <Link to="/reservation" className="btn-primary">Réserver une prestation</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-5">
                  À venir · {upcoming.length}
                </h2>
                <div className="space-y-4">
                  {upcoming.map(r => (
                    <div key={r.id} className="card p-6 hover:shadow-card transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-xl shrink-0">
                            💅
                          </div>
                          <div>
                            <h3 className="font-serif text-lg text-cream-900 mb-1">{r.service_name}</h3>
                            <p className="text-sm text-cream-500 font-sans capitalize mb-1">
                              {formatDate(r.slot_date)} · {r.slot_time.slice(0, 5)}
                            </p>
                            <p className="text-xs text-cream-400 font-sans">{r.service_duration} min · {r.service_price}€</p>
                            {r.notes && (
                              <p className="text-xs text-cream-400 font-sans mt-2 italic">"{r.notes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <StatusBadge status={r.status} />
                          {r.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              disabled={cancelling === r.id}
                              className="btn-danger text-xs py-1.5 px-3"
                            >
                              {cancelling === r.id ? 'Annulation…' : 'Annuler'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-5">
                  Historique · {past.length}
                </h2>
                <div className="space-y-3">
                  {past.map(r => (
                    <div key={r.id} className="card p-5 opacity-70 hover:opacity-90 transition-opacity">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-lg shrink-0">
                            💅
                          </div>
                          <div>
                            <h3 className="font-sans font-medium text-cream-700 text-sm">{r.service_name}</h3>
                            <p className="text-xs text-cream-400 font-sans capitalize">
                              {formatDate(r.slot_date)} · {r.slot_time.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-sans text-cream-500">{r.service_price}€</span>
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
