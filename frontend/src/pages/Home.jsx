import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkeletonCard from '../components/SkeletonCard';
import SectionHeader from '../components/SectionHeader';

const categoryLabels = {
  vernis: 'Vernis',
  gel: 'Gel',
  soin: 'Soin',
  art: 'Nail Art',
  standard: 'Standard',
};

const categoryColors = {
  vernis: 'bg-pink-50 text-pink-600 border-pink-100',
  gel:    'bg-cream-100 text-cream-700 border-cream-200',
  soin:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  art:    'bg-purple-50 text-purple-600 border-purple-100',
  standard: 'bg-cream-100 text-cream-600 border-cream-200',
};

function ServiceCard({ service }) {
  return (
    <div className="card p-6 hover:shadow-hover transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-sans font-medium px-2.5 py-1 rounded-full border ${categoryColors[service.category] || categoryColors.standard}`}>
          {categoryLabels[service.category] || service.category}
        </span>
        <span className="text-lg font-serif font-light text-cream-800">{service.price}€</span>
      </div>
      <h3 className="text-lg font-serif font-medium text-cream-900 mt-3 mb-2 group-hover:text-cream-700 transition-colors">
        {service.name}
      </h3>
      <p className="text-sm text-cream-500 font-sans leading-relaxed mb-4">
        {service.description}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-cream-400 font-sans">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {service.duration} min
      </div>
    </div>
  );
}

const steps = [
  {
    n: '01',
    title: 'Créez votre compte',
    desc: 'Inscrivez-vous en quelques secondes pour accéder à notre agenda en ligne.',
  },
  {
    n: '02',
    title: 'Choisissez votre prestation',
    desc: 'Parcourez notre catalogue de soins et sélectionnez ce qui vous convient.',
  },
  {
    n: '03',
    title: 'Réservez votre créneau',
    desc: 'Choisissez la date et l\'heure disponibles qui s\'adaptent à votre agenda.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('/api/services');
        setServices(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="pt-16">
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-cream-50 via-cream-100 to-nude-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cream-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-nude-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-cream-200 text-xs font-sans text-cream-600 mb-8 shadow-soft">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Institut ouvert — Réservez en ligne
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-cream-900 leading-tight mb-6">
              L'art de
              <br />
              <em className="not-italic text-cream-600">sublimer</em>
              <br />
              <span className="inline-flex items-center gap-4">
                vos ongles
                <span className="lg:hidden text-5xl md:text-6xl select-none" style={{ filter: 'drop-shadow(0 2px 8px rgba(139,100,64,0.2))' }}>💅</span>
              </span>
            </h1>

            <p className="text-cream-500 text-lg font-sans font-light leading-relaxed mb-10 max-w-md">
              Un institut dédié à l'excellence. Pose gel, semi-permanent, nail art — chaque prestation est réalisée avec minutie et passion.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/reservation" className="btn-primary">
                  Prendre rendez-vous
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link to="/inscription" className="btn-primary">
                    Créer un compte
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link to="/connexion" className="btn-secondary">
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-cream-200 to-nude-100 rounded-3xl shadow-card flex items-center justify-center">
                <img src="/logo.png" alt="Paula's Nails" className="w-64 h-64 object-contain" />
              </div>
              <div className="absolute -top-4 -right-6 card px-4 py-3 shadow-hover">
                <p className="text-xs font-sans text-cream-500 mb-0.5">Prochaine dispo</p>
                <p className="text-sm font-sans font-medium text-cream-800">Demain · 10h00</p>
              </div>
              <div className="absolute -bottom-4 -left-6 card px-4 py-3 shadow-hover">
                <p className="text-xs font-sans text-cream-500 mb-0.5">Résultat garanti</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-400">
          <span className="text-xs font-sans tracking-widest uppercase">Découvrir</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader supertitle="Nos prestations" title="Un soin pour chaque envie" />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to={user ? '/reservation' : '/inscription'} className="btn-primary">
              {user ? 'Réserver maintenant' : 'S\'inscrire pour réserver'}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-cream-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-500 mb-3">Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-cream-100">Simple et rapide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-cream-700 text-cream-500 font-serif text-sm mb-4">
                  {step.n}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute mt-6 ml-full w-full border-cream-800" />
                )}
                <h3 className="text-lg font-serif font-light text-cream-200 mb-3">{step.title}</h3>
                <p className="text-sm font-sans text-cream-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-cream-100 to-nude-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-cream-900 mb-6">
            Prêt·e à prendre soin de vous ?
          </h2>
          <p className="text-cream-500 font-sans mb-10">
            Rejoignez nos clientes et réservez votre prochaine séance en ligne, à tout moment.
          </p>
          <Link to={user ? '/reservation' : '/inscription'} className="btn-primary text-base px-8 py-4">
            {user ? 'Réserver un créneau' : 'Commencer maintenant'}
          </Link>
        </div>
      </section>
    </div>
  );
}
