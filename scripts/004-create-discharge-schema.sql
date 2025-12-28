-- Discharge & Handoff Tables

-- Patient discharge instructions
CREATE TABLE IF NOT EXISTS discharge_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  visit_summary TEXT,
  symptoms_discussed TEXT,
  watch_for TEXT,
  next_steps TEXT,
  disclaimer TEXT DEFAULT 'This is not a diagnosis. Please follow your healthcare provider''s recommendations.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultation_id)
);

-- Clinician handoff summary
CREATE TABLE IF NOT EXISTS clinician_handoff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  reason_for_visit TEXT,
  key_positive_findings TEXT,
  relevant_negatives TEXT,
  labs_summary TEXT,
  safety_considerations TEXT,
  pending_concerns TEXT,
  followup_needed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultation_id)
);

-- Discharge safety checklist
CREATE TABLE IF NOT EXISTS discharge_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultation_id, item_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discharge_instructions_consultation ON discharge_instructions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinician_handoff_consultation ON clinician_handoff(consultation_id);
CREATE INDEX IF NOT EXISTS idx_discharge_checklist_consultation ON discharge_checklist(consultation_id);
