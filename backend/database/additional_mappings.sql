-- Additional 20 NAMASTE-ICD11 Code Mappings
-- To be inserted into the namaste_icd11_mappings table

INSERT INTO public.namaste_icd11_mappings (
  namaste_code, namaste_label, namaste_description,
  icd11_code, icd11_label, icd11_description,
  category, ayush_system, confidence_score
) VALUES
  -- Ayurveda Additional Mappings (10 entries)
  ('AYU-104', 'Vatavyadhi', 'Neurological disorders caused by vitiated Vata dosha', 'G93.9', 'Disorder of brain, unspecified', 'Unspecified disorder of the brain', 'Neurological', 'Ayurveda', 0.82),
  
  ('AYU-105', 'Pittavyadhi', 'Liver and biliary disorders from aggravated Pitta dosha', 'K76.9', 'Liver disease, unspecified', 'Unspecified liver disease', 'Hepatic', 'Ayurveda', 0.86),
  
  ('AYU-106', 'Kaphavyadhi', 'Respiratory congestion from excessive Kapha dosha', 'J44.9', 'Chronic obstructive pulmonary disease, unspecified', 'Chronic airway obstruction', 'Respiratory', 'Ayurveda', 0.84),
  
  ('AYU-107', 'Hridroga', 'Heart diseases in Ayurvedic classification', 'I25.9', 'Chronic ischaemic heart disease, unspecified', 'Chronic heart condition', 'Cardiovascular', 'Ayurveda', 0.88),
  
  ('AYU-108', 'Shirahshula', 'Headaches and migraines in Ayurveda', 'G43.9', 'Migraine, unspecified', 'Recurrent headache disorder', 'Neurological', 'Ayurveda', 0.91),
  
  ('AYU-109', 'Netraroga', 'Eye disorders in Ayurvedic medicine', 'H57.9', 'Disorder of eye and adnexa, unspecified', 'Unspecified eye disorder', 'Ophthalmological', 'Ayurveda', 0.83),
  
  ('AYU-110', 'Karnashula', 'Ear pain and disorders in Ayurveda', 'H92.09', 'Otalgia, unspecified ear', 'Ear pain of unknown cause', 'Otological', 'Ayurveda', 0.89),
  
  ('AYU-111', 'Raktapitta', 'Bleeding disorders from pitta imbalance', 'D69.9', 'Hemorrhagic condition, unspecified', 'Unspecified bleeding disorder', 'Hematological', 'Ayurveda', 0.80),
  
  ('AYU-112', 'Gulma', 'Abdominal lumps or masses in Ayurveda', 'R19.00', 'Intra-abdominal and pelvic swelling, mass, unspecified site', 'Abdominal mass or swelling', 'Gastroenterological', 'Ayurveda', 0.78),
  
  ('AYU-113', 'Mutrakrichra', 'Urinary disorders and painful urination', 'R30.9', 'Painful urination, unspecified', 'Pain associated with urination', 'Urological', 'Ayurveda', 0.93),

  -- Unani System Additional Mappings (5 entries)
  ('UNA-102', 'Baras', 'Skin disorders and vitiligo in Unani medicine', 'L80', 'Vitiligo', 'Skin depigmentation disorder', 'Dermatological', 'Unani', 0.92),
  
  ('UNA-103', 'Safar', 'Jaundice in Unani system', 'K72.90', 'Hepatic failure, unspecified without coma', 'Liver dysfunction causing jaundice', 'Hepatic', 'Unani', 0.87),
  
  ('UNA-104', 'Qurha', 'Skin ulcers and wounds in Unani', 'L98.9', 'Disorder of skin and subcutaneous tissue, unspecified', 'Unspecified skin disorder', 'Dermatological', 'Unani', 0.85),
  
  ('UNA-105', 'Waja-ul-Mafasil', 'Joint pain and arthritis in Unani medicine', 'M25.50', 'Pain in unspecified joint', 'Joint pain without specified cause', 'Musculoskeletal', 'Unani', 0.90),
  
  ('UNA-106', 'Nazla', 'Common cold and nasal congestion in Unani', 'J00', 'Acute nasopharyngitis', 'Common cold', 'Respiratory', 'Unani', 0.94),

  -- Siddha System Mappings (3 entries)
  ('SID-101', 'Kaba Suram', 'Fever with phlegm in Siddha medicine', 'J20.9', 'Acute bronchitis, unspecified', 'Acute inflammation of bronchi', 'Respiratory', 'Siddha', 0.86),
  
  ('SID-102', 'Vatha Suram', 'Fever from Vata imbalance in Siddha', 'R50.2', 'Drug-induced fever', 'Fever caused by medication or treatment', 'General', 'Siddha', 0.79),
  
  ('SID-103', 'Pitha Suram', 'Fever from Pitta excess in Siddha system', 'A09', 'Other gastroenteritis and colitis', 'Digestive system inflammation with fever', 'Digestive', 'Siddha', 0.82),

  -- Homeopathy Additional Mappings (2 entries)
  ('HOM-102', 'Chronic Fatigue', 'Chronic exhaustion treated in Homeopathy', 'R53.1', 'Weakness', 'General weakness and fatigue', 'General', 'Homeopathy', 0.81),
  
  ('HOM-103', 'Anxiety Neurosis', 'Anxiety and panic disorders in Homeopathic treatment', 'F41.9', 'Anxiety disorder, unspecified', 'Unspecified anxiety disorder', 'Mental Health', 'Homeopathy', 0.88);