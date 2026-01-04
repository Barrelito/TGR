-- ========================================
-- Min Plan för Självförtroende - Schema
-- Baserad på Napoleon Hills Self-Confidence Formula
-- ========================================

-- Självförtroendeformeln - användarens signering
CREATE TABLE IF NOT EXISTS self_confidence_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- Personliga reflektioner för varje princip
  principle_1 TEXT, -- "Jag har kraften att lyckas" - vad vill du uppnå?
  principle_2 TEXT, -- "Mina tankar blir min verklighet" - vad ska du visualisera?
  principle_3 TEXT, -- "Mina önskemål skapar möjligheter" - din intention
  principle_4 TEXT, -- "Jag har ett tydligt mål" - ditt huvudmål
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logg för daglig läsning + timer-sessioner
CREATE TABLE IF NOT EXISTS self_confidence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pledge_id UUID REFERENCES self_confidence_pledges(id) ON DELETE CASCADE,
  log_type TEXT CHECK (log_type IN ('reading', 'visualization', 'mental_training')),
  duration_minutes INTEGER, -- NULL för läsning, 30 för visualisering, 10 för mental träning
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_confidence_pledges_user_id ON self_confidence_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_confidence_log_user_id ON self_confidence_log(user_id);
CREATE INDEX IF NOT EXISTS idx_confidence_log_logged_at ON self_confidence_log(logged_at);

-- RLS (Row Level Security)
ALTER TABLE self_confidence_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_confidence_log ENABLE ROW LEVEL SECURITY;

-- Public policy för anonyma användare (device_id)
-- Vi använder user_id som device_id för anonyma användare
CREATE POLICY "Anonymous users can CRUD pledges" ON self_confidence_pledges
  FOR ALL USING (true);

CREATE POLICY "Anonymous users can CRUD confidence logs" ON self_confidence_log
  FOR ALL USING (true);
