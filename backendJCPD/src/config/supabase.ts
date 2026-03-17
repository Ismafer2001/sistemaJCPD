import { createClient } from '@supabase/supabase-js';

// Estas variables vendrán de tu .env o de Render
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Inicializamos el cliente
export const supabase = createClient(supabaseUrl, supabaseKey);