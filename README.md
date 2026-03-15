# Paula's Nails — Application de réservation en ligne

Application web full-stack de prise de rendez-vous pour un institut de beauté ongulaire. Développée dans le cadre du titre professionnel **Concepteur Développeur d'Applications (CDA — RNCP 36490)**.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3 |
| Backend | Node.js, Express 4, Passport.js |
| Authentification | Passport Local + Google OAuth 2.0 |
| Base de données | PostgreSQL + `pg` (pool de connexions) |
| Sessions | `express-session` + `connect-pg-simple` |
| Sécurité | Helmet, express-rate-limit, bcrypt (coût 12), Zod |

---

## Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 14 (base de données créée manuellement)
- Un projet Google Cloud avec OAuth 2.0 configuré

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd paulas-nails
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Vérifier VITE_API_URL
npm run dev
```

---

## Variables d'environnement

### `backend/.env`

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur Express | `5001` |
| `SESSION_SECRET` | Secret de chiffrement des sessions (min. 64 chars aléatoires) | `openssl rand -hex 64` |
| `NODE_ENV` | Environnement (`development` / `production`) | `development` |
| `FRONTEND_URL` | URL du frontend (CORS + redirections OAuth) | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth 2.0 | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth 2.0 | `GOCSPX-xxx` |
| `ADMIN_PASSWORD` | Mot de passe du compte admin initial | `MonMotDePasse!` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données | `paulas_nails` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | — |

### `frontend/.env`

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:5001` |

---

## Configuration Google OAuth

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID**
3. Application type : **Web application**
4. URI de redirection autorisée : `http://localhost:5001/api/auth/google/callback`
5. Copier **Client ID** et **Client Secret** dans `backend/.env`
6. **OAuth consent screen** → ajouter son email dans **Test users**

---

## Scripts

### Backend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrage en mode développement (nodemon) |
| `npm start` | Démarrage en production |
| `npm test` | Lancer les tests (Vitest) |

### Frontend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |

---

## Architecture

```
paulas-nails/
├── backend/
│   ├── db/
│   │   └── database.js        # Pool PostgreSQL, initDB, seeds
│   ├── middleware/
│   │   └── auth.js            # isAuthenticated, isAdmin
│   ├── routes/
│   │   ├── auth.js            # /register /login /logout /me /google
│   │   ├── services.js        # CRUD services (admin)
│   │   ├── slots.js           # Gestion des créneaux
│   │   └── reservations.js    # Réservations (user + admin)
│   ├── server.js              # Point d'entrée Express
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, Toast
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Services, Slots, Reservations
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Welcome.jsx
│   │   │   ├── Reservation.jsx
│   │   │   ├── MyReservations.jsx
│   │   │   ├── CompleteProfile.jsx
│   │   │   └── PrivacyPolicy.jsx
│   │   └── App.jsx
│   └── .env.example
└── README.md
```

---

## Fonctionnalités

### Utilisateur
- Inscription avec validation Zod (email, mot de passe ≥ 8 chars, téléphone)
- Connexion locale (email/mot de passe) ou via Google OAuth 2.0
- Complétion de profil obligatoire (téléphone) après connexion Google
- Réservation en 3 étapes : prestation → créneau → confirmation
- Consultation et annulation de ses rendez-vous
- Page de bienvenue personnalisée avec prochain rendez-vous

### Administrateur
- Dashboard avec statistiques (réservations, taux de remplissage)
- Gestion des prestations (CRUD)
- Création de créneaux (unitaire ou en lot)
- Gestion des réservations (confirmation, annulation)
- Plan de tests interactif (27 cas)

---

## Sécurité

- **Helmet** : headers HTTP de sécurité (CSP, X-Frame-Options, HSTS…)
- **Rate limiting** : 10 tentatives / 15 min sur `/login` et `/register`
- **bcrypt** (coût 12) : hachage des mots de passe
- **Zod** : validation et sanitisation de toutes les entrées backend
- **Requêtes paramétrées** : protection contre les injections SQL
- **Sessions PostgreSQL** (`connect-pg-simple`) : persistance entre redémarrages
- **Cookie** : `httpOnly`, `sameSite: strict`, `secure` en production
- **CORS** : restreint à `FRONTEND_URL`
- **Rôles** : middleware `isAuthenticated` / `isAdmin` sur toutes les routes sensibles
- **Variables d'environnement** : aucun secret dans le code source

---

## Compte admin par défaut

| Champ | Valeur |
|-------|--------|
| Email | `admin@paulasnails.fr` |
| Mot de passe | Valeur de `ADMIN_PASSWORD` dans `.env` |

> Le compte admin est créé automatiquement au premier démarrage si la base est vide.

---

## Modèle de données (MCD/MLD)

```
┌─────────────────────┐         ┌─────────────────────┐
│        users        │         │      services        │
├─────────────────────┤         ├─────────────────────┤
│ PK id               │         │ PK id               │
│    name             │         │    name             │
│    email (UNIQUE)   │         │    description      │
│    password         │         │    duration (min)   │
│    role             │         │    price            │
│    phone            │         │    category         │
│    google_id        │         │    created_at       │
│    created_at       │         └──────────┬──────────┘
└──────────┬──────────┘                    │
           │ 1                             │ 1
           │                              │
           │           ┌──────────────────┴──────────────────┐
           │           │           reservations               │
           └──────────►│ PK id                                │
              N        │ FK user_id    → users(id)            │
                       │ FK service_id → services(id)         │
                       │ FK slot_id   → slots(id)             │
                       │    status (pending/confirmed/        │
                       │            cancelled)                │
                       │    notes                             │
                       │    created_at                        │
                       └──────────────────┬───────────────────┘
                                          │ N
                                          │
                              ┌───────────┴──────────┐
                              │        slots          │
                              ├──────────────────────┤
                              │ PK id                │
                              │    date (YYYY-MM-DD) │
                              │    time (HH:MM)      │
                              │    is_available      │
                              │    created_at        │
                              │ UNIQUE(date, time)   │
                              └──────────────────────┘

┌─────────────────────────────────────────┐
│               session                   │
├─────────────────────────────────────────┤
│ PK sid                                  │
│    sess (JSON)                          │
│    expire                               │
│ INDEX(expire)                           │
└─────────────────────────────────────────┘
```

**Cardinalités :**
- 1 `user` → N `reservations`
- 1 `service` → N `reservations`
- 1 `slot` → 1 `reservation` active (contrainte applicative + `is_available`)

---

## Conformité RGPD

- Consentement explicite obligatoire à l'inscription
- Page de politique de confidentialité complète
- Données minimales collectées (nom, email, téléphone)
