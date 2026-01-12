
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// To skip the "Connect Database" screen every time you reload,
// paste your Supabase Project URL and Anon Key inside the quotes below.
const PRECONFIGURED_URL = "https://jnsyoqbkpcziblavorvm.supabase.co"; 
const PRECONFIGURED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impuc3lvcWJrcGN6aWJsYXZvcnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODY3NzgsImV4cCI6MjA4MDc2Mjc3OH0.7OKZ0l2-uZQIFKyUToMLCND9l7vNLyUb-gl-c82-88c"; 
// ---------------------

// Helper to get config from Env, Preconfigured constants, or LocalStorage
const getEnv = (key: string, preconfiguredValue: string) => {
  // 1. Check Preconfigured variables (Top priority for this environment)
  if (preconfiguredValue && preconfiguredValue.length > 5) return preconfiguredValue;

  // 2. Check Vite env
  const meta = import.meta as any;
  if (meta && meta.env && meta.env[`VITE_${key}`]) {
      return meta.env[`VITE_${key}`];
  }

  // 3. Check process.env (Standard build environments) - SAFELY
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
  }
  
  // 4. Check LocalStorage (Fallback for browser-only setup)
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

const supabaseUrl = getEnv('SUPABASE_URL', PRECONFIGURED_URL);
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', PRECONFIGURED_KEY);

export let supabase: SupabaseClient | null = null;

// Only initialize if we have values to prevent crash
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client", e);
    // Leave supabase as null
  }
}

export const saveSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_ANON_KEY', key);
    window.location.reload();
}

export const clearSupabaseConfig = () => {
    localStorage.removeItem('SUPABASE_URL');
    localStorage.removeItem('SUPABASE_ANON_KEY');
    window.location.reload();
}
