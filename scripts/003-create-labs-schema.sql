-- Labs Schema for CliniSense
-- Stores lab results per consultation with AI analysis

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  flag TEXT CHECK (flag IN ('normal', 'mild', 'abnormal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab AI insights table
CREATE TABLE IF NOT EXISTS lab_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('abnormal', 'pattern', 'correlation', 'reassuring')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab safety checklist table
CREATE TABLE IF NOT EXISTS lab_safety_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultation_id, item_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lab_results_consultation_id ON lab_results(consultation_id);
CREATE INDEX IF NOT EXISTS idx_lab_ai_insights_consultation_id ON lab_ai_insights(consultation_id);
CREATE INDEX IF NOT EXISTS idx_lab_safety_checklist_consultation_id ON lab_safety_checklist(consultation_id);
