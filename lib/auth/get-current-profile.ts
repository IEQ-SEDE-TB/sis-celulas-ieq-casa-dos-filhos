import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export interface CurrentUserAndProfile {
  user: { id: string; email: string | null };
  profile: Profile | null;
}

/**
 * Busca o usuário autenticado (via cookies da requisição atual) e o
 * respectivo registro em `profiles`. Retorna `null` se não houver
 * ninguém autenticado.
 */
export async function getCurrentProfile(): Promise<CurrentUserAndProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile ?? null,
  };
}
