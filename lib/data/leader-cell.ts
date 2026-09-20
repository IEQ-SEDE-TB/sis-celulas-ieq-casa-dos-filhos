import { createClient } from "@/lib/supabase/server";
import type { Cell } from "@/types/database";

/**
 * Busca a célula em que `leader_id` é o profile informado. Retorna
 * `null` se o líder ainda não foi vinculado a nenhuma célula — quem
 * chama decide como exibir esse estado (ver /lider/dashboard, que
 * mostra uma mensagem orientando a contatar um admin).
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
