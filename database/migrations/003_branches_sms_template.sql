-- Filial uchun SMS shabloni (ixtiyoriy)
-- Placeholderlar: {{client_name}}, {{branch_name}}, {{branch_address}}, {{branch_phone}}, {{working_hours}}
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS sms_template TEXT NULL;

COMMENT ON COLUMN branches.sms_template IS 'SMS matni shabloni. Bo''sh bo''lsa default matn ishlatiladi.';
