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
  license_number VARCHAR(100), -- For doctors/healthcare providers
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
  category VARCHAR(100), -- e.g., 'Digestive', 'Respiratory', etc.
  ayush_system VARCHAR(50), -- e.g., 'Ayurveda', 'Unani', 'Siddha', 'Homeopathy'
  confidence_score DECIMAL(3,2) DEFAULT 1.00, -- Mapping confidence (0.00-1.00)
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for search performance
  INDEX idx_namaste_code (namaste_code),
  INDEX idx_icd11_code (icd11_code),
  INDEX idx_category (category),
  INDEX idx_ayush_system (ayush_system)
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure doctor role constraint
  CONSTRAINT fk_doctor_role CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = doctor_id AND role = 'doctor'
    )
  ),
  -- Ensure patient role constraint  
  CONSTRAINT fk_patient_role CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = patient_id AND role = 'patient'
    )
  )
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action audit_action NOT NULL,
  resource_type VARCHAR(100) NOT NULL, -- 'user', 'mapping', 'visit', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
);

-- Insert sample NAMASTE-ICD11 mappings
INSERT INTO public.namaste_icd11_mappings (
  namaste_code, namaste_label, namaste_description,
  icd11_code, icd11_label, icd11_description,
  category, ayush_system, confidence_score
) VALUES
  -- Digestive System
  ('AYU-101', 'Prameha', 'Diabetes-like condition in Ayurveda characterized by excessive urination and sweetness in urine', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Ayurveda', 0.95),
  
  ('AYU-102', 'Ama', 'Undigested food particles that create toxins in the body according to Ayurveda', 'K52.9', 'Gastroenteritis, unspecified', 'Inflammation of the stomach and intestines', 'Digestive', 'Ayurveda', 0.85),
  
  ('AYU-103', 'Ajirna', 'Indigestion or impaired digestion in Ayurvedic medicine', 'K30', 'Functional Dyspepsia', 'Chronic indigestion without identifiable organic cause', 'Digestive', 'Ayurveda', 0.90),
  
  -- Respiratory System  
  ('AYU-201', 'Jwara', 'Fever condition in Ayurveda, often with multiple systemic symptoms', 'R50.9', 'Fever, unspecified', 'Elevated body temperature of unknown origin', 'General', 'Ayurveda', 0.88),
  
  ('AYU-202', 'Kasa', 'Cough in Ayurvedic medicine, often related to respiratory imbalance', 'R05', 'Cough', 'Sudden expulsion of air from lungs', 'Respiratory', 'Ayurveda', 0.92),
  
  -- Musculoskeletal
  ('AYU-301', 'Sandhivata', 'Joint pain and stiffness similar to arthritis in Ayurveda', 'M79.3', 'Panniculitis, unspecified', 'Joint pain and inflammation', 'Musculoskeletal', 'Ayurveda', 0.87),
  
  -- Mental Health
  ('AYU-401', 'Unmada', 'Mental disorders/insanity in Ayurveda', 'F99', 'Mental disorder, not otherwise specified', 'Unspecified mental and behavioral disorder', 'Mental Health', 'Ayurveda', 0.80),
  
  -- Unani System
  ('UNA-101', 'Ziabetus Shakari', 'Diabetes in Unani medicine', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Unani', 0.93),
  
  ('UNA-201', 'Humma', 'Fever in Unani system', 'R50.9', 'Fever, unspecified', 'Elevated body temperature of unknown origin', 'General', 'Unani', 0.89),
  
  -- Homeopathy
  ('HOM-101', 'Diabetes Mellitus', 'Diabetes treatment approach in Homeopathy', 'E11.9', 'Type 2 Diabetes Mellitus', 'Chronic metabolic disorder characterized by high blood glucose levels', 'Endocrine', 'Homeopathy', 0.85),
  
  ('HOM-201', 'Influenza', 'Flu treatment in Homeopathic system', 'J11.9', 'Influenza, unspecified', 'Viral respiratory infection', 'Respiratory', 'Homeopathy', 0.90);

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

-- Only admins can modify mappings
CREATE POLICY "Admins can manage mappings" ON public.namaste_icd11_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients can read their own visits
CREATE POLICY "Patients can read own visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can read visits they created
CREATE POLICY "Doctors can read own patient visits" ON public.patient_visits
  FOR SELECT USING (auth.uid() = doctor_id);

-- Doctors can create visits
CREATE POLICY "Doctors can create visits" ON public.patient_visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Doctors can update visits they created
CREATE POLICY "Doctors can update own visits" ON public.patient_visits
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and Triggers
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
CREATE INDEX idx_visits_patient_id ON public.patient_visits(patient_id);
CREATE INDEX idx_visits_doctor_id ON public.patient_visits(doctor_id);
CREATE INDEX idx_visits_date ON public.patient_visits(visit_date);
CREATE INDEX idx_mappings_search ON public.namaste_icd11_mappings USING GIN (
  to_tsvector('english', namaste_label || ' ' || icd11_label || ' ' || COALESCE(namaste_description, '') || ' ' || COALESCE(icd11_description, ''))
);