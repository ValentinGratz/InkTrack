/*
# Create cartridges table (single-tenant, no auth)

1. New Tables
- `cartridges`
  - `id` (uuid, primary key)
  - `color` (text, not null) — couleur/modèle de la cartouche (ex: "Noir", "Couleur")
  - `start_date` (date, not null) — date d'installation de la cartouche
  - `end_date` (date, nullable) — date de remplacement; null tant que la cartouche est active
  - `duration_days` (integer, nullable) — durée totale en jours, calculée lors du remplacement
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `cartridges`.
- Allow anon + authenticated full CRUD (single-tenant app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS cartridges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  color text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  duration_days integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cartridges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cartridges" ON cartridges;
CREATE POLICY "anon_select_cartridges" ON cartridges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cartridges" ON cartridges;
CREATE POLICY "anon_insert_cartridges" ON cartridges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cartridges" ON cartridges;
CREATE POLICY "anon_update_cartridges" ON cartridges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cartridges" ON cartridges;
CREATE POLICY "anon_delete_cartridges" ON cartridges FOR DELETE
  TO anon, authenticated USING (true);
