import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Use placeholder values if environment variables are not set
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-key";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables not configured. Using placeholder values.");
  console.warn("To fix this, update your .env file with your Supabase credentials.");
}

export const supabase = createClient(url, key);


