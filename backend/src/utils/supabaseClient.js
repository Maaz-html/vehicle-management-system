const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Check for both common naming conventions
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('CRITICAL: SUPABASE_URL is missing in environment variables.');
}
if (!supabaseKey) {
  console.error('CRITICAL: SUPABASE_KEY is missing in environment variables.');
}

if (!supabaseUrl || !supabaseKey) {
  // We throw here to prevent the app from starting in a broken state
  throw new Error('Supabase configuration error: URL or Key is missing.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
