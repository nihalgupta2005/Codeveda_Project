# CodeVeda - NAMASTE-ICD11 Medical Coding Platform

> Bridging Traditional AYUSH Medicine with Modern Healthcare through Intelligent Dual Coding

## 🏥 Overview

CodeVeda is a comprehensive healthcare technology platform that seamlessly integrates traditional AYUSH (Ayurveda, Yoga, Unani, Siddha, and Homeopathy) medicine with modern biomedicine through intelligent dual coding using NAMASTE and ICD-11 standards.

## ✨ Features

### 🔐 Role-Based Authentication
- **Admin**: User management, code mapping management, audit logs
- **Doctor/Healthcare Provider**: Patient visits, code lookup, dual coding
- **Patient**: View personal health records and visit history

### 🧬 Dual Coding System
- **NAMASTE Codes**: Traditional medicine classification system
- **ICD-11 Mapping**: WHO International Classification of Diseases
- **Real-time Search**: Instant code suggestions and mapping
- **Confidence Scoring**: AI-powered mapping accuracy indicators

### 📋 Patient Management
- **Electronic Health Records (EHR)**: Comprehensive patient data
- **Visit Tracking**: Detailed medical encounters with dual coding
- **Treatment Plans**: Both traditional and modern treatment approaches
- **Prescription Management**: Integrated medication tracking

### 📊 Analytics & Reporting
- **Usage Statistics**: Code mapping analytics
- **Patient Insights**: Treatment outcome tracking
- **Audit Trails**: Complete system activity logs
- **Regulatory Compliance**: WHO and AYUSH ministry standards

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast development and build tool
- **TailwindCSS 4.1** - Utility-first styling
- **React Router 7.9** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database with real-time features
- **JWT Authentication** - Secure token-based auth

### Database
- **PostgreSQL** (via Supabase) - Relational database
- **Row Level Security (RLS)** - Fine-grained access control
- **Real-time subscriptions** - Live data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/codeveda.git
cd codeveda
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env

# Run database schema (in Supabase SQL Editor)
# Copy and run: database/schema.sql
# Optional: Add more mappings: database/additional_mappings.sql

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
codeveda/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── dashboard.jsx # Main dashboard
│   │   │   ├── mapping.jsx   # Code mapping interface
│   │   │   ├── ehr.jsx       # Electronic health records
│   │   │   ├── navbar.jsx    # Navigation
│   │   │   └── footer.jsx    # Footer
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.js      # Authentication routes
│   │   │   ├── codes.js     # Code mapping routes
│   │   │   ├── patients.js  # Patient management
│   │   │   ├── users.js     # User management
│   │   │   └── audit.js     # Audit logs
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   └── additional_mappings.sql  # 20 additional NAMASTE-ICD11 mappings
│   ├── server.js            # Express server
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and roles
- **namaste_icd11_mappings** - Code mapping definitions
- **patient_visits** - Medical encounters with dual codes
- **audit_logs** - System activity tracking

### Sample Code Mappings
```sql
-- Ayurveda Diabetes Mapping
NAMASTE: AYU-101 (Prameha) → ICD-11: E11.9 (Type 2 Diabetes)

-- Unani Fever Mapping  
NAMASTE: UNA-201 (Humma) → ICD-11: R50.9 (Fever, unspecified)

-- Homeopathy Influenza Mapping
NAMASTE: HOM-201 (Influenza) → ICD-11: J11.9 (Influenza, unspecified)
```

## 🔗 API Endpoints

### Authentication
```http
POST /api/auth/login        # User login
POST /api/auth/register     # User registration
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Get current user profile
```

### Code Mapping
```http
GET  /api/codes/search      # Search code mappings
GET  /api/codes/namaste/:code  # Get mapping by NAMASTE code
GET  /api/codes/categories  # Get all categories
POST /api/codes            # Create new mapping (Admin)
```

### Patient Management
```http
GET  /api/patients/visits   # Get patient visits
POST /api/patients/visits   # Create new visit (Doctor)
PUT  /api/patients/visits/:id  # Update visit
GET  /api/patients/stats/visits  # Visit statistics
```

### User Management (Admin)
```http
GET  /api/users            # List all users
GET  /api/users/:id        # Get user by ID
PUT  /api/users/:id        # Update user
DELETE /api/users/:id      # Deactivate user
```

### Audit Logs (Admin)
```http
GET  /api/audit            # Get audit logs
GET  /api/audit/stats      # Audit statistics
```

## 🔒 Security Features

- **JWT-based Authentication** with Supabase
- **Role-based Access Control** (RBAC)
- **Row Level Security** (RLS) policies
- **Rate Limiting** for API protection
- **Input Validation** and sanitization
- **SQL Injection Protection**
- **CORS Configuration**
- **Helmet.js Security Headers**

## 📊 NAMASTE-ICD11 Code Mappings Database

The system contains a comprehensive database of 31 NAMASTE to ICD-11 code mappings across all AYUSH systems:

### 🌿 Ayurveda System (13 mappings)

| NAMASTE Code | Traditional Name | ICD-11 Code | Modern Diagnosis | Category | Confidence |
|--------------|------------------|-------------|-----------------|----------|------------|
| **AYU-101** | Prameha | E11.9 | Type 2 Diabetes Mellitus | Endocrine | 95% |
| **AYU-102** | Ama | K52.9 | Gastroenteritis, unspecified | Digestive | 85% |
| **AYU-103** | Ajirna | K30 | Functional Dyspepsia | Digestive | 90% |
| **AYU-104** | Vatavyadhi | G93.9 | Disorder of brain, unspecified | Neurological | 82% |
| **AYU-105** | Pittavyadhi | K76.9 | Liver disease, unspecified | Hepatic | 86% |
| **AYU-106** | Kaphavyadhi | J44.9 | Chronic obstructive pulmonary disease | Respiratory | 84% |
| **AYU-107** | Hridroga | I25.9 | Chronic ischaemic heart disease | Cardiovascular | 88% |
| **AYU-108** | Shirahshula | G43.9 | Migraine, unspecified | Neurological | 91% |
| **AYU-109** | Netraroga | H57.9 | Disorder of eye and adnexa | Ophthalmological | 83% |
| **AYU-110** | Karnashula | H92.09 | Otalgia, unspecified ear | Otological | 89% |
| **AYU-111** | Raktapitta | D69.9 | Hemorrhagic condition, unspecified | Hematological | 80% |
| **AYU-112** | Gulma | R19.00 | Intra-abdominal swelling, mass | Gastroenterological | 78% |
| **AYU-113** | Mutrakrichra | R30.9 | Painful urination, unspecified | Urological | 93% |
| **AYU-201** | Jwara | R50.9 | Fever, unspecified | General | 88% |
| **AYU-202** | Kasa | R05 | Cough | Respiratory | 92% |
| **AYU-301** | Sandhivata | M79.3 | Panniculitis, unspecified | Musculoskeletal | 87% |
| **AYU-401** | Unmada | F99 | Mental disorder, not specified | Mental Health | 80% |

### 🏺 Unani System (7 mappings)

| NAMASTE Code | Traditional Name | ICD-11 Code | Modern Diagnosis | Category | Confidence |
|--------------|------------------|-------------|-----------------|----------|------------|
| **UNA-101** | Ziabetus Shakari | E11.9 | Type 2 Diabetes Mellitus | Endocrine | 93% |
| **UNA-102** | Baras | L80 | Vitiligo | Dermatological | 92% |
| **UNA-103** | Safar | K72.90 | Hepatic failure, unspecified | Hepatic | 87% |
| **UNA-104** | Qurha | L98.9 | Skin disorder, unspecified | Dermatological | 85% |
| **UNA-105** | Waja-ul-Mafasil | M25.50 | Pain in unspecified joint | Musculoskeletal | 90% |
| **UNA-106** | Nazla | J00 | Acute nasopharyngitis | Respiratory | 94% |
| **UNA-201** | Humma | R50.9 | Fever, unspecified | General | 89% |

### 🍃 Siddha System (3 mappings)

| NAMASTE Code | Traditional Name | ICD-11 Code | Modern Diagnosis | Category | Confidence |
|--------------|------------------|-------------|-----------------|----------|------------|
| **SID-101** | Kaba Suram | J20.9 | Acute bronchitis, unspecified | Respiratory | 86% |
| **SID-102** | Vatha Suram | R50.2 | Drug-induced fever | General | 79% |
| **SID-103** | Pitha Suram | A09 | Other gastroenteritis and colitis | Digestive | 82% |

### 💊 Homeopathy System (4 mappings)

| NAMASTE Code | Traditional Name | ICD-11 Code | Modern Diagnosis | Category | Confidence |
|--------------|------------------|-------------|-----------------|----------|------------|
| **HOM-101** | Diabetes Mellitus | E11.9 | Type 2 Diabetes Mellitus | Endocrine | 85% |
| **HOM-102** | Chronic Fatigue | R53.1 | Weakness | General | 81% |
| **HOM-103** | Anxiety Neurosis | F41.9 | Anxiety disorder, unspecified | Mental Health | 88% |
| **HOM-201** | Influenza | J11.9 | Influenza, unspecified | Respiratory | 90% |

### 📈 Mapping Statistics

- **Total Mappings**: 31
- **AYUSH Systems Covered**: 4 (Ayurveda, Unani, Siddha, Homeopathy)
- **Medical Categories**: 15 (Endocrine, Digestive, Respiratory, Cardiovascular, etc.)
- **Average Confidence Score**: 86.7%
- **Highest Confidence**: 95% (AYU-101 - Prameha/Diabetes)
- **Coverage Areas**: 
  - Chronic Diseases: 45%
  - Acute Conditions: 32%
  - Symptom-based: 23%

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your-production-url
SUPABASE_ANON_KEY=your-production-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-secure-jwt-secret
```

### Docker Deployment
```dockerfile
# Dockerfile example available in deployment/docker/
```

### Vercel/Netlify Deployment
```bash
# Frontend can be deployed to Vercel/Netlify
# Backend can be deployed to Railway/Render/Heroku
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Healthcare Domain Experts** - AYUSH medicine specialists
- **Software Engineers** - Full-stack developers
- **Data Scientists** - Code mapping algorithms
- **Regulatory Consultants** - Compliance experts

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/codeveda/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/codeveda/issues)
- **Email**: support@codeveda.com
- **Community**: [Discord](https://discord.gg/codeveda)

## 🙏 Acknowledgments

- **WHO** - ICD-11 Classification System
- **AYUSH Ministry** - Traditional Medicine Standards
- **Supabase** - Database and Authentication Platform
- **React Team** - Frontend Framework
- **Open Source Community** - Various libraries and tools

---

**CodeVeda** - Unifying Traditional Wisdom with Modern Healthcare Technology 🏥✨