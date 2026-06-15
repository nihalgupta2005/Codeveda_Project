-- ============================================
-- CodeVeda Database Schema (Fixed for Supabase/PostgreSQL)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (drop if they already exist to allow re-run)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('draft', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'search');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.namaste_icd11_mappings (
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

-- Patient Visits/Records (removed invalid CHECK constraints with subqueries)
CREATE TABLE IF NOT EXISTS public.patient_visits (
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
CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- ============================================
-- Indexes (PostgreSQL CREATE INDEX syntax)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_namaste_code ON public.namaste_icd11_mappings(namaste_code);
CREATE INDEX IF NOT EXISTS idx_icd11_code ON public.namaste_icd11_mappings(icd11_code);
CREATE INDEX IF NOT EXISTS idx_category ON public.namaste_icd11_mappings(category);
CREATE INDEX IF NOT EXISTS idx_ayush_system ON public.namaste_icd11_mappings(ayush_system);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON public.patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON public.patient_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.patient_visits(visit_date);

-- ============================================
-- Insert sample NAMASTE-ICD11 mappings
-- ============================================
INSERT INTO public.namaste_icd11_mappings (
  namaste_code, namaste_label, namaste_description,
  icd11_code, icd11_label, icd11_description,
  category, ayush_system, confidence_score
) VALUES
  ('AYU-101', 'Prameha', 'Diabetes-like condition in Ayurveda characterized by excessive urination and sweetness in urine', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Ayurveda', 0.95),
  ('AYU-102', 'Ama', 'Undigested food particles that create toxins in the body according to Ayurveda', 'K52.9', 'Gastroenteritis, unspecified', 'Inflammation of the stomach and intestines', 'Digestive', 'Ayurveda', 0.85),
  ('AYU-103', 'Ajirna', 'Indigestion or impaired digestion in Ayurvedic medicine', 'K30', 'Functional Dyspepsia', 'Chronic indigestion without identifiable organic cause', 'Digestive', 'Ayurveda', 0.90),
  ('AYU-104', 'Vatavyadhi', 'Nervous system disorders caused by Vata dosha imbalance', 'G93.9', 'Disorder of brain, unspecified', 'Neurological disorder', 'Neurological', 'Ayurveda', 0.82),
  ('AYU-105', 'Pittavyadhi', 'Liver and metabolic disorders caused by Pitta dosha imbalance', 'K76.9', 'Liver disease, unspecified', 'Hepatic disorder', 'Hepatic', 'Ayurveda', 0.86),
  ('AYU-106', 'Kaphavyadhi', 'Respiratory disorders caused by Kapha dosha imbalance', 'J44.9', 'Chronic obstructive pulmonary disease', 'COPD', 'Respiratory', 'Ayurveda', 0.84),
  ('AYU-107', 'Hridroga', 'Heart disease in Ayurveda', 'I25.9', 'Chronic ischaemic heart disease', 'Cardiovascular disease', 'Cardiovascular', 'Ayurveda', 0.88),
  ('AYU-108', 'Shirahshula', 'Headache and migraine in Ayurveda', 'G43.9', 'Migraine, unspecified', 'Migraine headache', 'Neurological', 'Ayurveda', 0.91),
  ('AYU-109', 'Netraroga', 'Eye disorders in Ayurveda', 'H57.9', 'Disorder of eye and adnexa', 'Ophthalmological disorder', 'Ophthalmological', 'Ayurveda', 0.83),
  ('AYU-110', 'Karnashula', 'Ear pain in Ayurveda', 'H92.09', 'Otalgia, unspecified ear', 'Ear pain', 'Otological', 'Ayurveda', 0.89),
  ('AYU-111', 'Raktapitta', 'Bleeding disorders in Ayurveda', 'D69.9', 'Hemorrhagic condition, unspecified', 'Bleeding disorder', 'Hematological', 'Ayurveda', 0.80),
  ('AYU-112', 'Gulma', 'Abdominal tumors/lumps in Ayurveda', 'R19.00', 'Intra-abdominal swelling, mass', 'Abdominal mass', 'Gastroenterological', 'Ayurveda', 0.78),
  ('AYU-113', 'Mutrakrichra', 'Painful urination in Ayurveda', 'R30.9', 'Painful urination, unspecified', 'Dysuria', 'Urological', 'Ayurveda', 0.93),
  ('AYU-201', 'Jwara', 'Fever condition in Ayurveda, often with multiple systemic symptoms', 'R50.9', 'Fever, unspecified', 'Elevated body temperature of unknown origin', 'General', 'Ayurveda', 0.88),
  ('AYU-202', 'Kasa', 'Cough in Ayurvedic medicine, often related to respiratory imbalance', 'R05', 'Cough', 'Sudden expulsion of air from lungs', 'Respiratory', 'Ayurveda', 0.92),
  ('AYU-301', 'Sandhivata', 'Joint pain and stiffness similar to arthritis in Ayurveda', 'M79.3', 'Panniculitis, unspecified', 'Joint pain and inflammation', 'Musculoskeletal', 'Ayurveda', 0.87),
  ('AYU-401', 'Unmada', 'Mental disorders/insanity in Ayurveda', 'F99', 'Mental disorder, not otherwise specified', 'Unspecified mental and behavioral disorder', 'Mental Health', 'Ayurveda', 0.80),
  ('UNA-101', 'Ziabetus Shakari', 'Diabetes in Unani medicine', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Unani', 0.93),
  ('UNA-102', 'Baras', 'Vitiligo in Unani medicine', 'L80', 'Vitiligo', 'Skin depigmentation disorder', 'Dermatological', 'Unani', 0.92),
  ('UNA-103', 'Safar', 'Jaundice/liver failure in Unani', 'K72.90', 'Hepatic failure, unspecified', 'Liver failure', 'Hepatic', 'Unani', 0.87),
  ('UNA-104', 'Qurha', 'Skin ulcers in Unani', 'L98.9', 'Skin disorder, unspecified', 'Skin condition', 'Dermatological', 'Unani', 0.85),
  ('UNA-105', 'Waja-ul-Mafasil', 'Joint pain in Unani', 'M25.50', 'Pain in unspecified joint', 'Joint pain', 'Musculoskeletal', 'Unani', 0.90),
  ('UNA-106', 'Nazla', 'Common cold in Unani', 'J00', 'Acute nasopharyngitis', 'Common cold', 'Respiratory', 'Unani', 0.94),
  ('UNA-201', 'Humma', 'Fever in Unani system', 'R50.9', 'Fever, unspecified', 'Elevated body temperature of unknown origin', 'General', 'Unani', 0.89),
  ('SID-101', 'Kaba Suram', 'Bronchitis-like fever in Siddha', 'J20.9', 'Acute bronchitis, unspecified', 'Bronchitis', 'Respiratory', 'Siddha', 0.86),
  ('SID-102', 'Vatha Suram', 'Vata-type fever in Siddha', 'R50.2', 'Drug-induced fever', 'Fever', 'General', 'Siddha', 0.79),
  ('SID-103', 'Pitha Suram', 'Pitta-type fever in Siddha', 'A09', 'Other gastroenteritis and colitis', 'GI infection', 'Digestive', 'Siddha', 0.82),
  ('HOM-101', 'Diabetes Mellitus', 'Diabetes treatment approach in Homeopathy', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Homeopathy', 0.85),
  ('HOM-102', 'Chronic Fatigue', 'Fatigue treatment in Homeopathy', 'R53.1', 'Weakness', 'General weakness', 'General', 'Homeopathy', 0.81),
  ('HOM-103', 'Anxiety Neurosis', 'Anxiety treatment in Homeopathy', 'F41.9', 'Anxiety disorder, unspecified', 'Anxiety', 'Mental Health', 'Homeopathy', 0.88),
  ('HOM-201', 'Influenza', 'Flu treatment in Homeopathic system', 'J11.9', 'Influenza, unspecified', 'Viral respiratory infection', 'Respiratory', 'Homeopathy', 0.90)
ON CONFLICT (namaste_code) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.namaste_icd11_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-run safety)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Everyone can read active mappings" ON public.namaste_icd11_mappings;
DROP POLICY IF EXISTS "Admins can manage mappings" ON public.namaste_icd11_mappings;
DROP POLICY IF EXISTS "Patients can read own visits" ON public.patient_visits;
DROP POLICY IF EXISTS "Doctors can read own patient visits" ON public.patient_visits;
DROP POLICY IF EXISTS "Doctors can create visits" ON public.patient_visits;
DROP POLICY IF EXISTS "Doctors can update own visits" ON public.patient_visits;
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Helper function to check user roles without causing RLS recursion
CREATE OR REPLACE FUNCTION public.check_user_role(user_id UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = required_role
  );
$$;

-- Users policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (public.check_user_role(auth.uid(), 'admin'::public.user_role));

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert users (needed for registration)
CREATE POLICY "Service role full access users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Mappings policies
CREATE POLICY "Everyone can read active mappings" ON public.namaste_icd11_mappings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage mappings" ON public.namaste_icd11_mappings
  FOR ALL USING (public.check_user_role(auth.uid(), 'admin'::public.user_role));

-- Patient visits policies
CREATE POLICY "Patients can read own visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can read own patient visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create visits" ON public.patient_visits
  FOR INSERT WITH CHECK (public.check_user_role(auth.uid(), 'doctor'::public.user_role));

CREATE POLICY "Doctors can update own visits" ON public.patient_visits
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Audit log policies
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (public.check_user_role(auth.uid(), 'admin'::public.user_role));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Functions and Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist (for re-run safety)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_mappings_updated_at ON public.namaste_icd11_mappings;
DROP TRIGGER IF EXISTS update_visits_updated_at ON public.patient_visits;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mappings_updated_at
  BEFORE UPDATE ON public.namaste_icd11_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.patient_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Auto-create user profile on signup trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'patient'::public.user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
