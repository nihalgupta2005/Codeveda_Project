# 🏥 CodeVeda Supabase Database Setup

## Quick Setup Instructions

### 1. Access Your Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: **wobfnrtirtodwqtfvncw**

### 2. Run Database Schema
1. **Click on** "SQL Editor" (on the left sidebar)
2. **Click** "New Query"
3. **Copy and paste** the following SQL code
4. **Click** "Run" to execute

---

## SQL Schema to Execute

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE visit_status AS ENUM ('draft', 'completed', 'cancelled');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'search');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  phone VARCHAR(20),
  license_number VARCHAR(100),
  organization VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NAMASTE-ICD11 Code Mappings
CREATE TABLE public.namaste_icd11_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  namaste_code VARCHAR(50) UNIQUE NOT NULL,
  namaste_label VARCHAR(255) NOT NULL,
  namaste_description TEXT,
  icd11_code VARCHAR(50) NOT NULL,
  icd11_label VARCHAR(255) NOT NULL,
  icd11_description TEXT,
  category VARCHAR(100),
  ayush_system VARCHAR(50),
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Visits/Records
CREATE TABLE public.patient_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id),
  doctor_id UUID NOT NULL REFERENCES public.users(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT,
  diagnosis TEXT NOT NULL,
  namaste_code VARCHAR(50) REFERENCES public.namaste_icd11_mappings(namaste_code),
  icd11_code VARCHAR(50),
  treatment_plan TEXT,
  prescription TEXT,
  notes TEXT,
  status visit_status DEFAULT 'draft',
  hospital_name VARCHAR(255),
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action audit_action NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample NAMASTE-ICD11 mappings
INSERT INTO public.namaste_icd11_mappings (
  namaste_code, namaste_label, namaste_description,
  icd11_code, icd11_label, icd11_description,
  category, ayush_system, confidence_score
) VALUES
  ('AYU-101', 'Prameha', 'Diabetes-like condition in Ayurveda', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder', 'Endocrine', 'Ayurveda', 0.95),
  ('AYU-102', 'Ama', 'Undigested food toxins in Ayurveda', 'K52.9', 'Gastroenteritis, unspecified', 'Stomach and intestine inflammation', 'Digestive', 'Ayurveda', 0.85),
  ('AYU-103', 'Ajirna', 'Indigestion in Ayurvedic medicine', 'K30', 'Functional Dyspepsia', 'Chronic indigestion', 'Digestive', 'Ayurveda', 0.90),
  ('AYU-201', 'Jwara', 'Fever condition in Ayurveda', 'R50.9', 'Fever, unspecified', 'Elevated body temperature', 'General', 'Ayurveda', 0.88),
  ('AYU-202', 'Kasa', 'Cough in Ayurvedic medicine', 'R05', 'Cough', 'Sudden expulsion of air from lungs', 'Respiratory', 'Ayurveda', 0.92),
  ('UNA-101', 'Ziabetus Shakari', 'Diabetes in Unani medicine', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder', 'Endocrine', 'Unani', 0.93),
  ('UNA-201', 'Humma', 'Fever in Unani system', 'R50.9', 'Fever, unspecified', 'Elevated body temperature', 'General', 'Unani', 0.89),
  ('HOM-101', 'Diabetes Mellitus', 'Diabetes in Homeopathy', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder', 'Endocrine', 'Homeopathy', 0.85),
  ('HOM-201', 'Influenza', 'Flu in Homeopathic system', 'J11.9', 'Influenza, unspecified', 'Viral respiratory infection', 'Respiratory', 'Homeopathy', 0.90);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.namaste_icd11_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can read active code mappings
CREATE POLICY "Everyone can read active mappings" ON public.namaste_icd11_mappings
  FOR SELECT USING (is_active = true);

-- Patients can read their own visits
CREATE POLICY "Patients can read own visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can read visits they created
CREATE POLICY "Doctors can read own patient visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = doctor_id);

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mappings_updated_at
  BEFORE UPDATE ON public.namaste_icd11_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.patient_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_mappings_namaste_code ON public.namaste_icd11_mappings(namaste_code);
CREATE INDEX idx_mappings_icd11_code ON public.namaste_icd11_mappings(icd11_code);
CREATE INDEX idx_mappings_category ON public.namaste_icd11_mappings(category);
CREATE INDEX idx_visits_patient_id ON public.patient_visits(patient_id);
CREATE INDEX idx_visits_doctor_id ON public.patient_visits(doctor_id);
CREATE INDEX idx_visits_date ON public.patient_visits(visit_date);
CREATE INDEX idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
```

---

### 3. Create Demo Users (Optional - for testing)

After running the schema, you can create demo users in Supabase Authentication:

1. **Go to** "Authentication" → "Users" (in Supabase dashboard)
2. **Click** "Add user" 
3. **Create these test accounts**:

```
Admin User:
- Email: admin@codeveda.com
- Password: admin123
- Auto Confirm: Yes

Doctor User:  
- Email: doctor@codeveda.com
- Password: doctor123
- Auto Confirm: Yes

Patient User:
- Email: patient@codeveda.com  
- Password: patient123
- Auto Confirm: Yes
```

### 4. After Creating Users, Update Their Profiles

Run this SQL to assign roles:

```sql
-- Insert user profiles (replace UUIDs with actual user IDs from auth.users)
INSERT INTO public.users (id, email, full_name, role, organization) VALUES
  ((SELECT id FROM auth.users WHERE email = 'admin@codeveda.com'), 'admin@codeveda.com', 'Admin User', 'admin', 'CodeVeda HQ'),
  ((SELECT id FROM auth.users WHERE email = 'doctor@codeveda.com'), 'doctor@codeveda.com', 'Dr. John Smith', 'doctor', 'City Hospital'),
  ((SELECT id FROM auth.users WHERE email = 'patient@codeveda.com'), 'patient@codeveda.com', 'Jane Doe', 'patient', NULL);
```

---

## ✅ Verification

After setup, you should see:
- ✅ 4 tables: `users`, `namaste_icd11_mappings`, `patient_visits`, `audit_logs`
- ✅ 9 sample code mappings
- ✅ 3 demo user accounts (if created)

---

## 🚀 Next Steps

Once database is set up:
1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Access: http://localhost:5173
4. Login with demo credentials

---

**Need help?** The setup should take ~5 minutes. Let me know when you've completed the SQL execution!