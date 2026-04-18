import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseDatabase } from "@/lib/types/database";

export const createClient = () => {
  return createBrowserClient<SupabaseDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
