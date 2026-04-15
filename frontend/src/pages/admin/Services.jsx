import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';

const CATEGORIES = [
  { value: 'vernis', label: 'Vernis' },
  { value: 'gel',    label: 'Gel' },
  { value: 'soin',   label: 'Soin' },
  { value: 'art',    label: 'Nail Art' },
  { value: 'standard', label: 'Standard' },
];

const emptyForm = { name: '', description: '', duration: '', price: '', category: 'standard' };

function ServiceModal({ service, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(service ? {
    name: service.name,
    description: service.description || '',
    duration: service.duration,
    price: service.price,
    category: service.category,
  } : emptyForm);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (service) {
        await axios.put(`/api/services/${service.id}`, form);
        addToast('Prestation mise à jour.', 'success');
      } else {
        await axios.post('/api/services', form);
        addToast('Prestation créée.', 'success');
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cream-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-8 shadow-hover">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-cream-900">{service ? 'Modifier la prestation' : 'Nouvelle prestation'}</h2>
          <button onClick={onClose} className="text-cream-400 hover:text-cream-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nom de la prestation</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Ex: Pose semi-permanent" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="Description détaillée de la prestation…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Durée (min)</label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange} className="input-field" min={5} placeholder="45" required />
            </div>
            <div>
              <label className="label">Prix (€)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="input-field" min={0} step={0.5} placeholder="35" required />
            </div>
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Enregistrement…' : service ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServices() {
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | service object
  const [deleting, setDeleting] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/services');
      setServices(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette prestation ?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/services/${id}`);
      addToast('Prestation supprimée.', 'info');
      fetchServices();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const categoryLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <div className="p-6 lg:p-8">
      {modal !== null && (
        <ServiceModal
          service={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchServices(); }}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-light text-cream-900">Prestations</h1>
          <p className="text-sm text-cream-400 font-sans mt-1">{services.length} prestation(s) au catalogue</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle prestation
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          description="Aucune prestation au catalogue."
          action={<button onClick={() => setModal('new')} className="btn-primary">Créer une prestation</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="card p-6 hover:shadow-card transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-sans text-cream-400 font-medium uppercase tracking-wide">
                  {categoryLabel(service.category)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModal(service)}
                    className="p-1.5 rounded-lg text-cream-400 hover:text-cream-700 hover:bg-cream-50 transition-all"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="p-1.5 rounded-lg text-cream-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="font-serif text-lg text-cream-900 mb-2">{service.name}</h3>
              <p className="text-xs text-cream-400 font-sans leading-relaxed mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between border-t border-cream-50 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-cream-400 font-sans">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration} min
                </div>
                <span className="font-serif text-lg text-cream-700">{service.price}€</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
