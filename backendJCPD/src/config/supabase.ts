import { createClient } from '@supabase/supabase-js';

// Estas variables vendrán de tu .env o de Render
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Inicializamos el cliente
// Solo creamos el cliente si AMBAS variables existen
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null

if (!supabase) {
  console.warn("⚠️ Supabase no está configurado. Algunas funciones no estarán disponibles.")
}