import { createClient } from "@supabase/supabase-js";
import { ADJECTIVES, PARTICIPANTS, SESSION_ID } from "./constants";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function ensureWorkshopData() {
  const supabase = getSupabaseAdmin();

  const { error: participantError } = await supabase.from("participants").upsert(PARTICIPANTS, {
    onConflict: "id"
  });
  if (participantError) throw participantError;

  const { error: adjectiveError } = await supabase.from("adjectives").upsert(ADJECTIVES, {
    onConflict: "id"
  });
  if (adjectiveError) throw adjectiveError;

  const { error: sessionError } = await supabase.from("sessions").upsert(
    {
      id: SESSION_ID,
      title: "Johari Window Workshop",
      status: "active"
    },
    { onConflict: "id" }
  );
  if (sessionError) throw sessionError;

  return supabase;
}
