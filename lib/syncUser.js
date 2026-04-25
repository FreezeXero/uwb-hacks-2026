import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function upsertUser(auth0User) {
  if (!auth0User || !auth0User.sub) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        auth0_id: auth0User.sub,
        email: auth0User.email || null,
        display_name:
          auth0User.name ||
          auth0User.nickname ||
          (auth0User.email ? auth0User.email.split("@")[0] : "Anonymous"),
      },
      {
        onConflict: "auth0_id",
        ignoreDuplicates: false,
      },
    )
    .select()
    .single();

  if (error) {
    console.error("Supabase upsertUser error:", error.message);
    return null;
  }

  return data;
}
