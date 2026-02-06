-- Baza va foydalanuvchini yaratish (postgres bilan ishga tushiring)
CREATE USER acoustic_crm24user WITH PASSWORD 'Acoustic&2026';
CREATE DATABASE acoustic_crm24db OWNER acoustic_crm24user;
GRANT ALL PRIVILEGES ON DATABASE acoustic_crm24db TO acoustic_crm24user;
