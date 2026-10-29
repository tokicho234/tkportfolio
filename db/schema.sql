-- Optional: the app creates these tables itself on first request.
-- Run this manually in the Neon SQL Editor only if you prefer to create them yourself.
CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS skills (id text PRIMARY KEY, name text NOT NULL, category text NOT NULL, level integer NOT NULL DEFAULT 50, pos integer NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS projects (id text PRIMARY KEY, title jsonb NOT NULL, descr jsonb NOT NULL DEFAULT '""', tags text NOT NULL DEFAULT '', pos integer NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS certs (id text PRIMARY KEY, title text NOT NULL, issuer text NOT NULL DEFAULT '', issued text NOT NULL DEFAULT '', detail jsonb NOT NULL DEFAULT '""', pos integer NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS cert_images (cert_id text PRIMARY KEY, mime text NOT NULL, data bytea NOT NULL, version bigint NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS messages (id bigserial PRIMARY KEY, name text NOT NULL, email text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS login_attempts (ip text NOT NULL, at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS login_attempts_at ON login_attempts (at);
