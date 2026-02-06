-- Bir platformada bir nechta ulanish (bir nechta bot, bir nechta profil) uchun
-- UNIQUE(platform) olib tashlanadi, name ustuni qo'shiladi

ALTER TABLE integrations ADD COLUMN IF NOT EXISTS name VARCHAR(255);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'integrations_platform_key'
    AND conrelid = 'integrations'::regclass
  ) THEN
    ALTER TABLE integrations DROP CONSTRAINT integrations_platform_key;
  END IF;
END $$;

COMMENT ON COLUMN integrations.name IS 'Ulanish nomi: masalan Reklama 1 bot, Asosiy Instagram';
