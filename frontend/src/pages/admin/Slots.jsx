import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

function groupByDate(slots) {
  return slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function AdminSlots() {
  const { addToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [date, setDate] = useState(getTomorrow());
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/slots');
      setSlots(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/slots', { date, time });
      addToast('Créneau créé.', 'success');
      setTime('');
      setShowForm(false);
      fetchSlots();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, hasReservation) => {
    if (hasReservation) {
      addToast('Ce créneau a une réservation active.', 'error');
      return;
    }
    if (!window.confirm('Supprimer ce créneau ?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/slots/${id}`);
      addToast('Créneau supprimé.', 'info');
      fetchSlots();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const grouped = groupByDate(slots);
  const dates = Object.keys(grouped).sort();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-light text-cream-900">Créneaux</h1>
          <p className="text-sm text-cream-400 font-sans mt-1">{slots.filter(s => s.is_available && !s.reservation_id).length} créneau(x) libre(s)</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un créneau
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 border-cream-200">
          <h2 className="font-serif text-lg text-cream-900 mb-5">Créer un créneau</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={date}
                min={getTomorrow()}
                onChange={e => setDate(e.target.value)}
                className="input-field max-w-xs"
                required
              />
            </div>

            <div>
              <label className="label">Heure</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input-field max-w-xs"
                required
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setTime(''); }} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Création…' : 'Créer le créneau'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
        </div>
      ) : dates.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-serif text-cream-700 mb-2">Aucun créneau</h3>
          <p className="text-cream-400 font-sans text-sm mb-6">Commencez par créer des créneaux disponibles pour vos clientes.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Créer un créneau</button>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(dateKey => {
            const daySlots = grouped[dateKey];
            const freeCount = daySlots.filter(s => s.is_available && !s.reservation_id).length;
            const bookedCount = daySlots.filter(s => s.reservation_id).length;

            return (
              <div key={dateKey} className="card overflow-hidden">
                <div className="px-6 py-4 bg-cream-50 border-b border-cream-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-sans font-medium text-cream-800 capitalize">
                      {formatDate(dateKey)}
                    </h3>
                    <p className="text-xs text-cream-400 font-sans mt-0.5">
                      {freeCount} libre · {bookedCount} réservé
                    </p>
                  </div>
                  <span className="text-sm font-sans text-cream-500">{daySlots.length} créneaux</span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => {
                      const isBooked = !!slot.reservation_id;
                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-sans ${
                            isBooked
                              ? 'bg-cream-50 border-cream-200 text-cream-500'
                              : 'bg-white border-cream-200 text-cream-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isBooked ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          {slot.time.slice(0, 5)}
                          {isBooked && (
                            <span className="text-xs text-cream-400">{slot.client_name}</span>
                          )}
                          {!isBooked && (
                            <button
                              onClick={() => handleDelete(slot.id, isBooked)}
                              disabled={deleting === slot.id}
                              className="ml-1 text-cream-300 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
