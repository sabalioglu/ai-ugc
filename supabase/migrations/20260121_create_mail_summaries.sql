-- Mail summaries tablosu
CREATE TABLE IF NOT EXISTS mail_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mail_id TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  original_text TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- İndeksler
  CONSTRAINT mail_summaries_mail_id_key UNIQUE (mail_id)
);

-- İndeksler ekle
CREATE INDEX IF NOT EXISTS idx_mail_summaries_from ON mail_summaries(from_address);
CREATE INDEX IF NOT EXISTS idx_mail_summaries_received ON mail_summaries(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_summaries_created ON mail_summaries(created_at DESC);

-- Full-text search için GIN index
CREATE INDEX IF NOT EXISTS idx_mail_summaries_search
ON mail_summaries
USING GIN (to_tsvector('turkish', subject || ' ' || summary));

-- Row Level Security (RLS) politikaları
ALTER TABLE mail_summaries ENABLE ROW LEVEL SECURITY;

-- Authenticated kullanıcılar okuyabilir
CREATE POLICY "Allow authenticated users to read mail summaries"
ON mail_summaries
FOR SELECT
TO authenticated
USING (true);

-- Authenticated kullanıcılar yazabilir
CREATE POLICY "Allow authenticated users to insert mail summaries"
ON mail_summaries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Service role herkesi okuyabilir (Edge Functions için)
CREATE POLICY "Allow service role full access"
ON mail_summaries
FOR ALL
TO service_role
USING (true);

-- Yorum ekle
COMMENT ON TABLE mail_summaries IS 'n8n workflow tarafından oluşturulan mail özetleri';
COMMENT ON COLUMN mail_summaries.mail_id IS 'Gmail veya mail sağlayıcısından gelen unique mail ID';
COMMENT ON COLUMN mail_summaries.summary IS 'AI tarafından oluşturulan mail özeti';
COMMENT ON COLUMN mail_summaries.original_text IS 'Mailin orjinal plain text içeriği (opsiyonel)';
