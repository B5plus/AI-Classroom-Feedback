CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('feedback', 'suggestion', 'problem')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);


CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
  ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_category 
  ON contact_submissions(category);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
  ON contact_submissions(email);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON contact_submissions;
DROP POLICY IF EXISTS "Allow service role full access" ON contact_submissions;


CREATE POLICY "Allow public inserts" 
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);


CREATE POLICY "Allow authenticated reads" 
  ON contact_submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');


CREATE POLICY "Allow service role full access" 
  ON contact_submissions
  FOR ALL
  USING (auth.role() = 'service_role');


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



CREATE OR REPLACE VIEW contact_submissions_summary AS
SELECT 
  category,
  COUNT(*) as total_submissions,
  COUNT(DISTINCT email) as unique_users,
  DATE_TRUNC('day', created_at) as submission_date
FROM contact_submissions
GROUP BY category, DATE_TRUNC('day', created_at)
ORDER BY submission_date DESC, category;


GRANT SELECT ON contact_submissions_summary TO authenticated;

