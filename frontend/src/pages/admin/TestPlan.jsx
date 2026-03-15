import React, { useState } from 'react';

const STATUS = {
  ok: { label: 'OK', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  fail: { label: 'Échec', className: 'bg-red-100 text-red-700 border-red-200' },
  pending: { label: 'À tester', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const testCases = [
  {
    category: 'Authentification',
    tests: [
      { id: 'A01', description: 'Inscription avec des données valides', expected: 'Compte créé, redirection vers /reservation', status: 'ok' },
      { id: 'A02', description: 'Inscription sans cocher la case RGPD', expected: 'Message d\'erreur RGPD affiché', status: 'ok' },
      { id: 'A03', description: 'Inscription avec email déjà utilisé', expected: 'Message d\'erreur : email existant', status: 'ok' },
      { id: 'A04', description: 'Inscription avec mots de passe différents', expected: 'Message d\'erreur : mots de passe non conformes', status: 'ok' },
      { id: 'A05', description: 'Connexion avec identifiants valides', expected: 'Connexion réussie, accès au tableau de bord', status: 'ok' },
      { id: 'A06', description: 'Connexion avec mauvais mot de passe', expected: 'Message d\'erreur : identifiants incorrects', status: 'ok' },
      { id: 'A07', description: 'Déconnexion', expected: 'Session détruite, redirection vers accueil', status: 'ok' },
      { id: 'A08', description: 'Accès à /reservation sans être connecté', expected: 'Redirection vers /connexion', status: 'ok' },
    ],
  },
  {
    category: 'Réservation (utilisateur)',
    tests: [
      { id: 'R01', description: 'Sélection d\'une prestation à l\'étape 1', expected: 'Carte prestation sélectionnée (surlignage), passage à l\'étape 2', status: 'ok' },
      { id: 'R02', description: 'Sélection d\'un créneau date/heure à l\'étape 2', expected: 'Créneau sélectionné, passage à l\'étape 3', status: 'ok' },
      { id: 'R03', description: 'Confirmation de réservation', expected: 'Réservation enregistrée en base, slot marqué indisponible', status: 'ok' },
      { id: 'R04', description: 'Annulation d\'une réservation en attente', expected: 'Statut "annulée", slot libéré', status: 'ok' },
      { id: 'R05', description: 'Affichage des réservations personnelles', expected: 'Liste des réservations de l\'utilisateur connecté uniquement', status: 'ok' },
      { id: 'R06', description: 'Réservation sur un créneau déjà pris', expected: 'Créneau non affiché (filtré côté API)', status: 'ok' },
    ],
  },
  {
    category: 'Administration — Prestations',
    tests: [
      { id: 'S01', description: 'Ajout d\'une nouvelle prestation', expected: 'Prestation ajoutée en base, visible sur la page d\'accueil', status: 'ok' },
      { id: 'S02', description: 'Ajout avec champs obligatoires manquants', expected: 'Formulaire bloqué ou message d\'erreur', status: 'ok' },
      { id: 'S03', description: 'Suppression d\'une prestation', expected: 'Prestation retirée de la liste et de la BDD', status: 'ok' },
    ],
  },
  {
    category: 'Administration — Créneaux',
    tests: [
      { id: 'C01', description: 'Création d\'un créneau unitaire', expected: 'Créneau visible dans la liste des slots', status: 'ok' },
      { id: 'C02', description: 'Création en masse (plusieurs horaires pour une date)', expected: 'Tous les créneaux créés et listés', status: 'ok' },
      { id: 'C03', description: 'Suppression d\'un créneau libre', expected: 'Créneau supprimé', status: 'ok' },
      { id: 'C04', description: 'Suppression d\'un créneau réservé', expected: 'Message d\'erreur : suppression impossible', status: 'ok' },
    ],
  },
  {
    category: 'Administration — Réservations',
    tests: [
      { id: 'AR01', description: 'Confirmation d\'une réservation en attente', expected: 'Statut passe à "confirmée"', status: 'ok' },
      { id: 'AR02', description: 'Annulation d\'une réservation par l\'admin', expected: 'Statut passe à "annulée", slot libéré', status: 'ok' },
      { id: 'AR03', description: 'Filtrage par statut (en attente / confirmée / annulée)', expected: 'Seules les réservations du statut sélectionné sont affichées', status: 'ok' },
      { id: 'AR04', description: 'Recherche par nom de client', expected: 'Résultats filtrés en temps réel', status: 'ok' },
    ],
  },
  {
    category: 'Sécurité & Accès',
    tests: [
      { id: 'SEC01', description: 'Accès à /admin sans être admin', expected: 'Redirection vers /', status: 'ok' },
      { id: 'SEC02', description: 'Accès direct à /api/reservations sans session', expected: 'Réponse 401 Unauthorized', status: 'ok' },
      { id: 'SEC03', description: 'Accès à /api/reservations (GET all) en tant qu\'utilisateur simple', expected: 'Réponse 403 Forbidden', status: 'ok' },
      { id: 'SEC04', description: 'Mot de passe stocké en clair dans la BDD', expected: 'Non — hash bcrypt uniquement', status: 'ok' },
    ],
  },
  {
    category: 'RGPD & Accessibilité',
    tests: [
      { id: 'RG01', description: 'Inscription sans cocher RGPD', expected: 'Inscription bloquée, message d\'erreur affiché', status: 'ok' },
      { id: 'RG02', description: 'Page Politique de confidentialité accessible', expected: 'Page /politique-confidentialite chargée correctement', status: 'ok' },
      { id: 'RG03', description: 'Navigation clavier uniquement (Tab / Entrée)', expected: 'Tous les éléments interactifs atteignables au clavier', status: 'ok' },
      { id: 'RG04', description: 'Lien d\'évitement (skip link) visible au focus', expected: 'Lien "Aller au contenu principal" visible lors du Tab initial', status: 'ok' },
      { id: 'RG05', description: 'Attributs aria-label sur les formulaires', expected: 'Attributs aria présents, lecteurs d\'écran compatibles', status: 'ok' },
    ],
  },
];

const statusKeys = ['ok', 'fail', 'pending'];

export default function TestPlan() {
  const [statuses, setStatuses] = useState(() => {
    const init = {};
    testCases.forEach(cat => cat.tests.forEach(t => { init[t.id] = t.status; }));
    return init;
  });

  const toggle = (id) => {
    setStatuses(s => {
      const cur = statusKeys.indexOf(s[id]);
      return { ...s, [id]: statusKeys[(cur + 1) % statusKeys.length] };
    });
  };

  const total = Object.keys(statuses).length;
  const okCount = Object.values(statuses).filter(s => s === 'ok').length;
  const failCount = Object.values(statuses).filter(s => s === 'fail').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-light text-cream-900 mb-1">Plan de tests</h1>
        <p className="text-sm text-cream-500 font-sans">Cliquez sur un badge de statut pour le faire pivoter (OK → Échec → À tester)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-3xl font-serif font-light text-emerald-600">{okCount}</p>
          <p className="text-xs font-sans text-cream-500 mt-1">Tests OK</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-serif font-light text-red-500">{failCount}</p>
          <p className="text-xs font-sans text-cream-500 mt-1">Échecs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-serif font-light text-cream-700">{total}</p>
          <p className="text-xs font-sans text-cream-500 mt-1">Total</p>
        </div>
      </div>

      <div className="space-y-6">
        {testCases.map(cat => (
          <div key={cat.category} className="card overflow-hidden">
            <div className="px-5 py-3 bg-cream-50 border-b border-cream-100">
              <h2 className="text-sm font-sans font-semibold text-cream-800 uppercase tracking-wide">{cat.category}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm font-sans">
                <thead>
                  <tr className="border-b border-cream-100 text-xs text-cream-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 w-16">ID</th>
                    <th className="text-left px-5 py-3">Cas de test</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Résultat attendu</th>
                    <th className="text-center px-5 py-3 w-28">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.tests.map((t, i) => (
                    <tr key={t.id} className={`border-b border-cream-50 ${i % 2 === 0 ? '' : 'bg-cream-50/40'}`}>
                      <td className="px-5 py-3 text-cream-400 font-mono text-xs">{t.id}</td>
                      <td className="px-5 py-3 text-cream-700">{t.description}</td>
                      <td className="px-5 py-3 text-cream-500 hidden md:table-cell">{t.expected}</td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggle(t.id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:opacity-80 ${STATUS[statuses[t.id]].className}`}
                          title="Cliquer pour changer le statut"
                          aria-label={`Statut du test ${t.id} : ${STATUS[statuses[t.id]].label}. Cliquer pour changer.`}
                        >
                          {STATUS[statuses[t.id]].label}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-cream-400 font-sans text-center mt-8">
        Tests réalisés manuellement — Application Paula's Nails · {new Date().getFullYear()}
      </p>
    </div>
  );
}
