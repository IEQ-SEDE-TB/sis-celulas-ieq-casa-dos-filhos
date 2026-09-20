"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { getDefaultChurchId } from "@/lib/data/default-church";

export type LeaderCellFormState = { error: string } | null;

/**
 * Cadastro de célula feito pelo próprio líder (autoatendimento). Só
 * cria — nunca edita — e só quando o líder logado ainda não tem
 * nenhuma célula vinculada; essa checagem é repetida aqui mesmo já
 * tendo sido feita na página, porque a Server Action pode ser chamada
 * diretamente sem passar pela renderização da página.
 */
export async function createLeaderCell(
  _prevState: LeaderCellFormState,
  formData: FormData
): Promise<LeaderCellFormState> {
  const profile = await requireLeader();

  const existingCell = await getLeaderCell(profile.id);
  if (existingCell) {
    redirect("/lider/dashboard");
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const location = (formData.get("location") as string | null)?.trim() || null;
  const address = (formData.get("address") as string | null)?.trim() || null;

  if (!name) {
    return { error: "Informe o nome da célula." };
  }

  let churchId: string;
  try {
    churchId = await getDefaultChurchId();
  } catch {
    return {
      error:
        "Não foi possível preparar os dados da igreja. Tente novamente em instantes ou avise um administrador.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cells").insert({
    name,
    location,
    address,
    leader_id: profile.id,
    church_id: churchId,
    active: true,
    member_count: 0,
  });

  if (error) {
    // Cobre o caso raro de corrida (duas abas/requisições criando a
    // célula "ao mesmo tempo"): a constraint/policy do banco barra a
    // segunda, e aqui devolvemos uma mensagem amigável em vez do erro
    // cru do Postgres.
    return {
      error:
        "Não foi possível criar a célula — se você já tinha uma vinculada, atualize a página. Tente novamente.",
    };
  }

  revalidatePath("/lider/dashboard");
  redirect("/lider/dashboard");
}
