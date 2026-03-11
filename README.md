# Paula's Nails — Application de réservation en ligne

Application web complète de réservation pour un institut d'ongles, développée dans le cadre du titre professionnel **Concepteur Développeur d'Applications (RNCP 37873)**.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios |
| Backend | Node.js 24, Express 4, Passport.js (Local Strategy) |
| Base de données | PostgreSQL (via `pg`) |
| Authentification | Sessions (express-session + memorystore), bcrypt |
| Style | Design system custom (palette crème/nude, Cormorant Garamond + Inter) |

---

## Prérequis

- **Node.js** v22+ (testé sur v24.14.0)
- **npm** v9+
- **PostgreSQL** v14+
- **pgAdmin** (optionnel, pour visualiser la BDD)

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd testProjet
```

### 2. Configurer la base de données PostgreSQL

Dans pgAdmin ou psql, exécuter :

```sql
CREATE DATABASE paulas_nails;
```

### 3. Configurer les variables d'environnement

Créer/éditer le fichier `backend/.env` :

```env
PORT=5001
SESSION_SECRET=votre_secret_session_ici

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
DB_NAME=paulas_nails
```

### 4. Installer les dépendances backend

```bash
cd backend
npm install
```

### 5. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

---

## Lancement en développement

### Option A — Script tout-en-un

```bash
bash start.sh
```

### Option B — Terminaux séparés

**Terminal 1 — Backend (port 5001) :**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend (port 5173) :**
```bash
cd frontend
npm run dev
```

Ouvrir : **http://localhost:5173**

---

## Compte administrateur par défaut

| Champ | Valeur |
|---|---|
| Email | `admin@paulasnails.fr` |
| Mot de passe | `Admin2024!` |

> Le compte admin est créé automatiquement au premier démarrage du backend si la base de données est vide.

---

## Architecture du projet

```
testProjet/
├── backend/
│   ├── db/
│   │   └── database.js        # Connexion PostgreSQL + seed initial
│   ├── middleware/
│   │   └── auth.js            # Middleware isAuthenticated / isAdmin
│   ├── routes/
│   │   ├── auth.js            # POST /login, /logout, /register, GET /me
│   │   ├── services.js        # CRUD prestations
│   │   ├── slots.js           # CRUD créneaux horaires
│   │   └── reservations.js    # CRUD réservations
│   ├── .env                   # Variables d'environnement (non versionné)
│   ├── package.json
│   └── server.js              # Point d'entrée Express
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, Toast
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reservation.jsx
│   │   │   ├── MyReservations.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Services.jsx
│   │   │       ├── Slots.jsx
│   │   │       ├── Reservations.jsx
│   │   │       └── TestPlan.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js         # Proxy /api → localhost:5001
│
├── start.sh                   # Script de démarrage
└── README.md
```

---

## Schéma de la base de données

```sql
-- Utilisateurs
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  password  TEXT NOT NULL,          -- Hash bcrypt
  phone     VARCHAR(20),
  role      VARCHAR(10) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prestations
CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  duration    INTEGER NOT NULL,     -- En minutes
  price       NUMERIC(6,2) NOT NULL,
  category    VARCHAR(50) DEFAULT 'standard',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Créneaux horaires
CREATE TABLE slots (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, time)
);

-- Réservations
CREATE TABLE reservations (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service_id  INTEGER REFERENCES services(id) ON DELETE SET NULL,
  slot_id     INTEGER REFERENCES slots(id) ON DELETE SET NULL,
  status      VARCHAR(20) DEFAULT 'pending',  -- pending / confirmed / cancelled
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API — Endpoints principaux

### Authentification `/api/auth`
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Créer un compte |
| POST | `/login` | Se connecter |
| POST | `/logout` | Se déconnecter |
| GET | `/me` | Récupérer l'utilisateur courant |

### Prestations `/api/services`
| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | Public |
| POST | `/` | Admin |
| DELETE | `/:id` | Admin |

### Créneaux `/api/slots`
| Méthode | Route | Accès |
|---|---|---|
| GET | `/available` | Authentifié |
| GET | `/` | Admin |
| POST | `/` | Admin |
| POST | `/bulk` | Admin |
| DELETE | `/:id` | Admin |

### Réservations `/api/reservations`
| Méthode | Route | Accès |
|---|---|---|
| GET | `/my` | Authentifié |
| GET | `/` | Admin |
| POST | `/` | Authentifié |
| PATCH | `/:id/status` | Admin |
| PATCH | `/:id/cancel` | Authentifié (propriétaire) |

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (facteur de coût 12)
- Sessions sécurisées : cookie `httpOnly`, `SameSite=Lax`, `secure` en production
- Accès aux routes protégées via middleware `isAuthenticated` et `isAdmin`
- Validation des entrées côté serveur sur toutes les routes POST/PATCH

---

## Conformité RGPD

- Consentement explicite recueilli à l'inscription (case à cocher obligatoire)
- Page **Politique de confidentialité** accessible à `/politique-confidentialite`
- Données minimales collectées (pas de carte bancaire, téléphone optionnel)
- Droits utilisateurs décrits (accès, rectification, effacement, portabilité)

---

## Accessibilité (RGAA)

- Attribut `lang="fr"` sur la balise `<html>`
- Lien d'évitement *"Aller au contenu principal"* (skip link)
- Navigation clavier complète (Tab / Entrée / Espace)
- Attributs `aria-label`, `aria-required`, `aria-invalid`, `aria-expanded` sur les éléments interactifs
- Balises sémantiques : `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`
- Messages d'erreur associés aux champs via `aria-describedby`

---

## Déploiement en production

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Déployer le dossier dist/ sur Vercel
```

### Backend (Railway / VPS)
1. Configurer les variables d'environnement sur le serveur
2. Installer les dépendances : `npm install --omit=dev`
3. Démarrer : `node server.js` (ou utiliser PM2 : `pm2 start server.js`)
4. Mettre `NODE_ENV=production` dans `.env` pour activer les cookies sécurisés

---

## Auteur

Projet réalisé dans le cadre du titre professionnel **Concepteur Développeur d'Applications** (RNCP 37873) — Niveau 6 (Bac+3).
