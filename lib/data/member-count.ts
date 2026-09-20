import { createClient } from "@/lib/supabase/server";

/**
 * Recalcula `cells.member_count` (membros ativos e não-visitantes) via
 * a função `recalculate_cell_member_count` no banco (SECURITY DEFINER).
 *
 * A função confere sozinha se quem chama é admin/senior ou o líder
 * daquela célula, então este helper funciona tanto no módulo de
 * membros do admin quanto no do líder — sem precisar de uma policy de
 * UPDATE em `cells` para o líder (que só pode ler a própria célula,
 * não editar colunas dela livremente).
 */
export async function recalculateMemberCount(cellId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("recalculate_cell_member_count", {
    target_cell_id: cellId,
  });
}
