import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Cartridge = {
  id: string;
  color: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  price: number | null;
  brand: string | null;
  created_at: string;
};

export type CartridgeInsert = {
  color: string;
  start_date: string;
  end_date?: string | null;
  duration_days?: number | null;
  price?: number | null;
  brand?: string | null;
};
