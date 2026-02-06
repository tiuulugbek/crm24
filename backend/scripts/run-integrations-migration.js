/**
 * Integrations jadvaliga name ustuni qo'shadi va platform unique ni olib tashlaydi.
 * Ishga tushirish: node scripts/run-integrations-migration.js
 * (backend papkasida: npm run migration:integrations yoki node scripts/run-integrations-migration.js)
 */
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'acoustic_crm24user',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'acoustic_crm24db',
});

const sql = `
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS name VARCHAR(255);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'integrations_platform_key'
    AND conrelid = 'public.integrations'::regclass
  ) THEN
    ALTER TABLE integrations DROP CONSTRAINT integrations_platform_key;
  END IF;
END $$;

COMMENT ON COLUMN integrations.name IS 'Ulanish nomi: masalan Reklama 1 bot, Asosiy Instagram';
`;

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migratsiya bajarildi: integrations.name qo\'shildi, UNIQUE(platform) olib tashlandi.');
  } catch (e) {
    console.error('Xato:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
