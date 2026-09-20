import { createClient } from "@/lib/supabase/server";
import type { Cell } from "@/types/database";

/**
 * Busca a célula em que `leader_id` é o profile informado. Retorna
 * `null` se o líder ainda não foi vinculado a nenhuma célula — nesse
 * caso o fluxo do app manda o usuário para /lider/celula/nova, onde
 * ele mesmo cadastra a célula (ver app/page.tsx e
 * app/(protected)/lider/dashboard/page.tsx).
 */
export async function getLeaderCell(profileId: string): Promise<Cell | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("cells")
    .select("*")
    .eq("leader_id", profileId)
    .maybeSingle();

  return data ?? null;
}
