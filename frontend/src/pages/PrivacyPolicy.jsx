import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-xl font-serif font-medium text-cream-900 mb-4 pb-2 border-b border-cream-100">{title}</h2>
    <div className="text-sm text-cream-600 font-sans leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-cream-700 font-sans transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-cream-400 mb-3">Mentions légales</p>
          <h1 className="text-4xl font-serif font-light text-cream-900 mb-4">Politique de confidentialité</h1>
          <p className="text-sm text-cream-400 font-sans">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="card p-8 md:p-12">

          <Section title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données personnelles collectées via ce site est :<br />
              <strong className="text-cream-800">Paula's Nails</strong><br />
              12 rue Vital Carles, 33000 Bordeaux <br />
              contact@paulasnails.fr — +33 6 17 67 83 60
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>Dans le cadre de la création d'un compte et de la prise de rendez-vous, nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-cream-700">Identité</strong> : nom et prénom</li>
              <li><strong className="text-cream-700">Contact</strong> : adresse e-mail, numéro de téléphone (optionnel)</li>
              <li><strong className="text-cream-700">Données de connexion</strong> : adresse e-mail, mot de passe chiffré (bcrypt)</li>
              <li><strong className="text-cream-700">Données de réservation</strong> : prestations choisies, créneaux réservés, notes éventuelles</li>
            </ul>
            <p>Aucune donnée bancaire n'est collectée ni traitée par ce site.</p>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données personnelles sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gérer votre compte client et vous authentifier</li>
              <li>Enregistrer, confirmer et suivre vos réservations</li>
              <li>Vous contacter en cas de modification ou d'annulation de rendez-vous</li>
              <li>Assurer la sécurité et le bon fonctionnement du service</li>
            </ul>
          </Section>

          <Section title="4. Base légale">
            <p>Le traitement de vos données repose sur :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-cream-700">Votre consentement</strong> (art. 6.1.a RGPD) — recueilli lors de la création du compte</li>
              <li><strong className="text-cream-700">L'exécution d'un contrat</strong> (art. 6.1.b RGPD) — pour la gestion des réservations</li>
            </ul>
          </Section>

          <Section title="5. Durée de conservation">
            <p>Vos données sont conservées pendant :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-cream-700">Données de compte</strong> : jusqu'à la suppression du compte ou 3 ans après la dernière activité</li>
              <li><strong className="text-cream-700">Données de réservation</strong> : 3 ans à compter de la date de la prestation</li>
            </ul>
          </Section>

          <Section title="6. Destinataires des données">
            <p>Vos données ne sont ni vendues, ni louées, ni cédées à des tiers. Elles restent hébergées sur nos serveurs et ne sont accessibles qu'à l'équipe de Paula's Nails.</p>
          </Section>

          <Section title="7. Vos droits (RGPD)">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-cream-700">Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong className="text-cream-700">Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong className="text-cream-700">Droit à l'effacement</strong> : demander la suppression de vos données</li>
              <li><strong className="text-cream-700">Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong className="text-cream-700">Droit d'opposition</strong> : vous opposer à certains traitements</li>
              <li><strong className="text-cream-700">Droit de retrait du consentement</strong> : à tout moment, sans affecter les traitements antérieurs</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à : <strong className="text-cream-700">contact@paulasnails.fr</strong></p>
            <p>En cas de litige, vous pouvez saisir la <strong className="text-cream-700">CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) — <span className="text-cream-500">www.cnil.fr</span></p>
          </Section>

          <Section title="8. Sécurité des données">
            <p>Nous mettons en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chiffrement des mots de passe avec l'algorithme bcrypt (facteur de coût 12)</li>
              <li>Sessions sécurisées avec cookies httpOnly</li>
              <li>Accès aux données restreint par rôle (utilisateur / administrateur)</li>
              <li>Communications sécurisées via HTTPS en production</li>
            </ul>
          </Section>

          <Section title="9. Cookies">
            <p>Ce site utilise uniquement un cookie de session technique, nécessaire au bon fonctionnement de l'authentification. Ce cookie est httpOnly et n'est pas accessible via JavaScript. Aucun cookie publicitaire ni tracker tiers n'est utilisé.</p>
          </Section>

        </div>

        <div className="text-center mt-10">
          <Link to="/" className="btn-secondary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
