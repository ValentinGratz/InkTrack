/*
# Add price and brand columns to cartridges table

1. Modified Tables
- `cartridges`
  - `price` (numeric, nullable) — optional purchase price in euros
  - `brand` (text, nullable) — optional brand/model info (e.g. "HP 305", "Officielle", "Générique")

2. Notes
- Both columns are nullable since existing cartridges don't have this data.
- No data loss: only adds new columns.
*/

ALTER TABLE cartridges
  ADD COLUMN IF NOT EXISTS price numeric(10, 2),
  ADD COLUMN IF NOT EXISTS brand text;
