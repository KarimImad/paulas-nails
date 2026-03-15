import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const categoryLabels = {
  vernis: 'Vernis',
  gel: 'Gel',
  soin: 'Soin',
  art: 'Nail Art',
  standard: 'Standard',
};

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

const STEPS = ['Prestation', 'Créneau', 'Confirmation'];

export default function Reservation() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, sl] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/slots/available'),
        ]);
        setServices(s.data);
        setSlots(sl.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedSlots = groupSlotsByDate(slots);
  const availableDates = Object.keys(groupedSlots).sort();

  const handleSelectService = (s) => {
    setSelectedService(s);
    setStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/reservations', {
        service_id: selectedService.id,
        slot_id: selectedSlot.id,
        notes: notes.trim() || undefined,
      });
      addToast('Réservation confirmée !', 'success');
      navigate('/mes-reservations');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la réservation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
          <p className="text-cream-400 text-sm font-sans">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cream-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-3">Prise de rendez-vous</p>
          <h1 className="page-header">Réserver une prestation</h1>
        </div>

        <div className="flex items-center justify-center mb-12 gap-0">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`w-9 h-9 rounded-full text-sm font-sans font-medium border-2 transition-all ${
                    i === step
                      ? 'bg-cream-800 border-cream-800 text-white'
                      : i < step
                      ? 'bg-cream-200 border-cream-300 text-cream-700 hover:bg-cream-300 cursor-pointer'
                      : 'bg-white border-cream-200 text-cream-400 cursor-default'
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </button>
                <span className={`text-xs font-sans hidden sm:block ${i === step ? 'text-cream-800 font-medium' : 'text-cream-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-16 mx-2 mb-5 transition-all ${i < step ? 'bg-cream-300' : 'bg-cream-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="section-title text-center mb-8">Quelle prestation souhaitez-vous ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`card p-5 text-left hover:shadow-hover transition-all duration-200 hover:border-cream-300 active:scale-98 ${
                    selectedService?.id === service.id ? 'border-cream-400 shadow-card' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-sans text-cream-400 font-medium uppercase tracking-wide">
                      {categoryLabels[service.category] || service.category}
                    </span>
                    <span className="text-base font-serif text-cream-700">{service.price}€</span>
                  </div>
                  <h3 className="font-serif text-lg text-cream-900 mb-2">{service.name}</h3>
                  <p className="text-xs text-cream-400 font-sans leading-relaxed mb-3">{service.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-cream-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration} min
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Choisissez un créneau</h2>
              <button onClick={() => setStep(0)} className="btn-ghost text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
            </div>

            <div className="card p-4 mb-6 flex items-center gap-4 bg-cream-50 border-cream-200">
              <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-lg">
                💅
              </div>
              <div>
                <p className="text-sm font-medium text-cream-800 font-sans">{selectedService.name}</p>
                <p className="text-xs text-cream-400 font-sans">{selectedService.duration} min · {selectedService.price}€</p>
              </div>
            </div>

            {availableDates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-serif text-cream-700 mb-2">Aucun créneau disponible</h3>
                <p className="text-cream-400 font-sans text-sm">Revenez prochainement, de nouveaux créneaux seront ajoutés.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="label mb-3">Sélectionnez une date</p>
                  <div className="flex flex-wrap gap-3">
                    {availableDates.map(date => (
                      <button
                        key={date}
                        onClick={() => handleSelectDate(date)}
                        className={`px-4 py-3 rounded-xl border text-sm font-sans transition-all ${
                          selectedDate === date
                            ? 'bg-cream-800 border-cream-800 text-white shadow-soft'
                            : 'bg-white border-cream-200 text-cream-700 hover:border-cream-400 hover:shadow-soft'
                        }`}
                      >
                        <span className="block font-medium capitalize">
                          {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className={`block text-xs mt-0.5 ${selectedDate === date ? 'text-cream-300' : 'text-cream-400'}`}>
                          {groupedSlots[date].length} dispo
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <p className="label mb-3">Sélectionnez une heure</p>
                    <p className="text-sm text-cream-500 font-sans mb-4 capitalize">
                      {formatDate(selectedDate)}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {groupedSlots[selectedDate].map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => handleSelectSlot(slot)}
                          className={`px-5 py-3 rounded-xl border text-sm font-sans font-medium transition-all ${
                            selectedSlot?.id === slot.id
                              ? 'bg-cream-800 border-cream-800 text-white shadow-soft'
                              : 'bg-white border-cream-200 text-cream-700 hover:border-cream-400 hover:shadow-soft'
                          }`}
                        >
                          {slot.time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Confirmer la réservation</h2>
              <button onClick={() => setStep(1)} className="btn-ghost text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-5">Récapitulatif</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-cream-500 font-sans mb-1">Prestation</p>
                    <p className="font-serif text-lg text-cream-900">{selectedService.name}</p>
                  </div>
                  <span className="text-cream-600 font-sans font-medium">{selectedService.price}€</span>
                </div>
                <div className="border-t border-cream-100 pt-4">
                  <p className="text-sm text-cream-500 font-sans mb-1">Date & heure</p>
                  <p className="font-sans font-medium text-cream-800 capitalize">
                    {formatDate(selectedSlot.date)}
                  </p>
                  <p className="font-sans text-cream-600">{selectedSlot.time.slice(0, 5)}</p>
                </div>
                <div className="border-t border-cream-100 pt-4">
                  <p className="text-sm text-cream-500 font-sans mb-1">Durée estimée</p>
                  <p className="font-sans font-medium text-cream-800">{selectedService.duration} minutes</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="label">Note pour l'esthéticienne <span className="text-cream-300 normal-case tracking-normal">(optionnel)</span></label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: allergie à certains produits, préférence particulière…"
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full py-4 text-base"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Confirmation en cours…
                </span>
              ) : (
                <>
                  Confirmer ma réservation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-xs text-cream-400 font-sans mt-4">
              Vous pourrez annuler votre rendez-vous depuis votre espace client.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
