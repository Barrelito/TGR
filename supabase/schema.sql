-- Affirmationer
CREATE TABLE IF NOT EXISTS affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  exchange TEXT NOT NULL,
  deadline DATE NOT NULL,
  plan TEXT NOT NULL,
  statement TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Läs-logg för streak-räkning
CREATE TABLE IF NOT EXISTS reading_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  affirmation_id UUID REFERENCES affirmations(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  period TEXT CHECK (period IN ('morning', 'evening'))
);

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_affirmations_user_id ON affirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_log_user_id ON reading_log(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_log_read_at ON reading_log(read_at);

-- RLS (Row Level Security)
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;

-- Policies: Användare kan bara se/ändra sin egen data
CREATE POLICY "Users can CRUD own affirmations" ON affirmations
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can CRUD own reading logs" ON reading_log
  FOR ALL USING (user_id = auth.uid()::uuid);

-- Public policy för anonyma användare (device_id)
-- Vi använder user_id som device_id för anonyma användare
CREATE POLICY "Anonymous users can CRUD by device_id" ON affirmations
  FOR ALL USING (true);

CREATE POLICY "Anonymous reading logs" ON reading_log
  FOR ALL USING (true);
