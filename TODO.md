# Paula's Nails — TODO & Checklist CDA

## ✅ Fait

### Sécurité
- [x] Requêtes SQL paramétrées (anti-injection)
- [x] Bcrypt coût 12 sur les mots de passe
- [x] Helmet (headers HTTP)
- [x] CORS restreint à FRONTEND_URL
- [x] Rate limiting sur /login et /register
- [x] Cookies httpOnly + sameSite
- [x] Transactions SQL avec BEGIN/COMMIT/ROLLBACK + SELECT FOR UPDATE
- [x] Variables d'environnement (pas de secrets dans le code)
- [x] Validation Zod sur les routes auth
- [x] SESSION_SECRET fort généré

### Fonctionnalités
- [x] Inscription locale (email + mdp + téléphone)
- [x] Connexion locale
- [x] Connexion Google OAuth 2.0
- [x] Complétion de profil obligatoire après OAuth
- [x] Réservation en 3 étapes (prestation → créneau → confirmation)
- [x] Statut auto-confirmé à la création (plus de validation admin requise)
- [x] Annulation par le client
- [x] Consultation des réservations (à venir / historique)
- [x] Dashboard admin (statistiques, taux de remplissage)
- [x] Gestion des prestations CRUD (admin)
- [x] Gestion des créneaux — unitaire + en lot (admin)
- [x] Gestion des réservations (admin — annuler, rétablir)
- [x] Plan de tests interactif (27 cas)
- [x] Page politique de confidentialité (RGPD)
- [x] Consentement explicite à l'inscription

### Emails (nodemailer + Brevo)
- [x] Mail de confirmation au client à la réservation
- [x] Mail d'annulation au client (par lui ou par l'admin)
- [x] Notification à l'admin à chaque nouvelle réservation
- [x] Templates HTML aux couleurs du site (cream/nude)

### RGPD
- [x] Consentement explicite à l'inscription
- [x] Page politique de confidentialité
- [x] Endpoint DELETE /api/auth/account
- [x] Bouton "Supprimer mon compte" dans /mes-reservations

### Documentation
- [x] README complet (stack, installation, variables d'env, architecture)
- [x] MCD/MLD dans le README

---

## 🔧 À faire — Technique

- [ ] **Rate limiting sur POST /reservations** — éviter le spam de réservations
- [ ] **Index PostgreSQL** — améliorer les performances (users.email, reservations.user_id, slots.date)

---

## 📋 À faire — Dossier CDA

- [ ] **Maquettes annotées** — captures d'écran des 10 pages clés annotées sur Canva/Figma
  - [ ] Page d'accueil
  - [ ] Inscription
  - [ ] Connexion
  - [ ] Bienvenue
  - [ ] Réservation (3 étapes)
  - [ ] Mes réservations
  - [ ] Admin — Dashboard
  - [ ] Admin — Réservations
  - [ ] Admin — Créneaux
  - [ ] Email de confirmation (capture)

- [ ] **Diagramme de séquence** — flux de réservation (UML)
- [ ] **Diagramme de classes ou composants** — architecture frontend/backend

---

## 🚀 À faire — Déploiement

- [ ] **Choisir une plateforme** (Railway recommandé — gratuit, simple)
- [ ] **Créer le Dockerfile** ou utiliser le buildpack Railway
- [ ] **Configurer les variables d'environnement** en production
- [ ] **Mettre à jour GOOGLE_CLIENT_ID callback URL** pour le domaine de production
- [ ] **Vérifier l'expéditeur Brevo** sur le domaine de production
- [ ] **Tester le flow complet** en production (inscription → réservation → mail)

---

## 💡 Améliorations optionnelles (non bloquantes)

- [ ] **Mot de passe oublié** — flux complet : token temporaire en base (expire 1h), mail avec lien, page de réinitialisation. À mentionner en jury comme "feature identifiée et architecturée".
- [ ] Changer son mot de passe depuis l'espace connecté
- [ ] Pagination sur les listes admin (si beaucoup de données)
- [ ] Timeout sur les requêtes axios côté frontend
- [ ] Error boundaries React
- [ ] Page profil utilisateur dédiée
- [ ] Rappel de rendez-vous par email (J-1)
