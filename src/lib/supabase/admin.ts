import { createClient } from '@supabase/supabase-js';

// Buat Supabase client menggunakan service_role key 
// Client ini memiliki izin admin penuh dan mengabaikan Row Level Security (RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan variabel env ini ada di .env.local
);
