## 🏥 CodeVeda — NAMASTE-ICD11 Dual-Medical Coding Platform

> Bridging Traditional AYUSH Medicine with Modern Healthcare through Intelligent Dual Coding

**🌐 Live Deployments:**
* **Vercel:** [https://codeveda-project.vercel.app/](https://codeveda-project.vercel.app/)
* **Netlify:** [https://codevedaproject.netlify.app](https://codevedaproject.netlify.app)

CodeVeda is an advanced, production-ready healthcare technology platform that integrates traditional AYUSH systems (Ayurveda, Yoga, Unani, Siddha, and Homeopathy) with modern biomedicine. It provides doctors, healthcare professionals, and administrators with an intelligent dual-coding system mapping NAMASTE (National AYUSH Morbidity and Standardized Terminology Electronic) and ICD-11 (International Classification of Diseases, 11th Revision) standards.


---

## 🎨 User Interface & Experience
The platform features a modern, responsive user interface built using React and styled with a customized theme designed for clinical environments.

***Dashboard**: Unified workspace displaying summary cards for code mappings, recent patient visits, active users, and system audit logs.
* **Code Mapping & Lookups**: A database search interface for looking up mapping between AYUSH codes and modern ICD-11 classifications with real-time confidence scores.
* **Electronic Health Records (EHR)**: Secure storage of patient encounters, diagnosis history, treatment plans, prescriptions, and administrative logs.
* **Admin Center**: Dedicated panels for mapping management, role auditing, and user access control.

---

## ✨ Core Capabilities

* **🔐 Role-Based Access Control (RBAC)**: Secure, verified views for Administrators (manage mappings, users, audit logs), Doctors (patient visits, code lookup, dual coding), and Patients (health records, visit history).
* **🧬 Multi-System Mapping**: Full dictionary support for Ayurveda, Unani, Siddha, and Homeopathy mapped to modern ICD-11 codes.
* **🛡️ Production Security**: Built with JWT authentication, Row Level Security (RLS) via Supabase, API rate limiting, and robust input validation.
* **📊 Live Audit Logs**: Immutable recording of clinical operations, logins, and mapping modifications to comply with healthcare regulatory standards.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | UI View Library & High-Performance Bundler |
| **Styling** | Vanilla CSS + TailwindCSS | Clean, responsive component layout & dark mode |
| **Backend** | Node.js + Express.js | Core Rest API, Business Logic, and Middleware |
| **Database** | PostgreSQL (Supabase) | Cloud relational database, real-time sync, and auth |
| **Authentication** | Supabase Auth (JWT) | Secure, passwordless or email-based session tokens |

---

## 📂 Project Structure

```text
codeveda/
├── frontend/                 # React client SPA
│   ├── src/
│   │   ├── components/       # Interface modules (ehr.jsx, mapping.jsx, dashboard.jsx)
│   │   ├── contexts/         # Authentication and State Contexts
│   │   ├── config/           # Supabase client instantiation
│   │   ├── App.jsx           # Routing & protected routes configuration
│   │   └── main.jsx          # Vite React entrypoint
│   ├── package.json          # Frontend packages & build commands
│   └── vite.config.js        # Vite bundler options
├── backend/                  # RESTful API server
│   ├── src/
│   │   ├── routes/           # Routing layers (auth, codes, patients, audit, users)
│   │   ├── middleware/       # JWT parsing, role checkers, rate limiters
│   │   └── utils/            # Shared utilities & database wrapper
│   ├── database/             # Schema definition & seed SQL files
│   ├── server.js             # Main server execution file
│   └── package.json          # Node dependencies & runtime scripts
├── .gitignore                # Global ignore rules for clean repository state
└── README.md                 # Primary system manual (this file)
```

---

## 🚀 Local Quickstart Guide

### 1. Database Setup (Supabase)
1. Register or log in to [Supabase](https://supabase.com/).
2. Create a new project named `CodeVeda`.
3. Open the **SQL Editor** in your Supabase dashboard and run the schema file located in:
   `backend/database/schema.sql` (or `backend/database/schema_fixed.sql`).
4. (Optional) Run the mappings file to seed additional clinical terminologies:
   `backend/database/additional_mappings.sql`.

### 2. Configure Environment Variables
Create `.env` files in both frontend and backend directories.

#### **Backend Config (`backend/.env`)**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-secret
JWT_SECRET=your-random-secure-jwt-secret-string
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

#### **Frontend Config (`frontend/.env`)**
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation & Run

#### **Launch Backend API:**
```bash
cd backend
npm install
npm run dev
```
The server starts on `http://localhost:5000`. Run a quick health check at `http://localhost:5000/api/health`.

#### **Launch Frontend Application:**
```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard opens on `http://localhost:5173`.

---

## 🚢 Production Deployment Guide

Deploying CodeVeda to production requires moving your backend server to a cloud hosting platform and hosting the frontend assets on a Static Host / CDN.

### 1. Backend Server Deployment (Render / Railway / fly.io)
The backend runs as a continuous Express process.

#### **Option A: Railway (Recommended)**
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub** and select your repository.
3. In settings, configure the Root Directory to `backend`.
4. Add the required Environment Variables:
   - `PORT=5000` (Railway automatically sets `PORT`, so you can omit this or let Railway bind it)
   - `NODE_ENV=production`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (Use a cryptographically secure 256-bit string)
5. Deploy. Railway will provision a live API URL (e.g., `https://codeveda-backend.up.railway.app`).

#### **Option B: Render**
1. Log in to [Render.com](https://render.com/).
2. Create a **New Web Service** and link your Git repository.
3. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add all environment variables listed in `backend/.env` under the "Environment" tab.
5. Click **Create Web Service**. Note the generated URL.

---

### 2. Frontend Deployment (Netlify / Vercel)
The React client must be built to static HTML/JS/CSS assets and uploaded to a static server.

#### **Option A: Netlify**
1. Register or log in to [Netlify](https://netlify.com/).
2. Choose **Add New Site** -> **Import an Existing Project** -> **GitHub**.
3. Choose the `codeveda` repository.
4. Set the build parameters:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Go to **Site Settings** -> **Environment variables** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://codeveda-backend.up.railway.app/api`).
6. Save and click **Deploy Site**.
7. To support React Router client-side path handling, add a `_redirects` file in `frontend/public/` with the following line before building:
   ```text
   /*   /index.html   200
   ```

#### **Option B: Vercel (Recommended)**
1. Register or log in to [Vercel](https://vercel.com/).
2. Click **New Project** and import the `codeveda` repository.
3. Configure the project settings:
   - **Framework Preset**: Vite (detected automatically)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_API_URL`: The URL of your deployed backend Express server (e.g., `https://codeveda-api.up.railway.app/api`).
5. Click **Deploy**. Vercel will build the React app and deploy it.
6. Single Page App (SPA) routing handling is pre-configured via the [frontend/vercel.json](file:///c:/Users/Nihal%20Gupta/OneDrive/Desktop/Code/codeveda/frontend/vercel.json) file included in the repository.

---

### 3. Supabase Configuration (Security & Access)
Before letting users register in production:
1. Ensure your **Supabase JWT Secret** matches the backend `JWT_SECRET` for secure verified signatures.
2. Verify that your **Row Level Security (RLS)** is active on tables like `patient_visits`, `audit_logs`, and `users`.
3. In **Authentication -> URL Configuration**, add your deployed Netlify domain as an **Allowed Redirect URL** to allow login flows.

---

## 🔒 Security Best Practices
* **Keep secrets safe**: Never commit files containing `.env` to version control. They are ignored by the root `.gitignore`.
* **Database Access**: In production, do not expose the `SUPABASE_SERVICE_ROLE_KEY` on the client side. Use it ONLY in the Node.js backend.
* **CORS Limits**: Restrict CORS origins in the Express server to only permit requests from your production frontend domain.

---

# 📜 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
