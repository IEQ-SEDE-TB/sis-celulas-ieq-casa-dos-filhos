"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";

export type MemberFormState = { error: string } | null;

/**
 * Recalcula `cells.member_count` a partir dos membros atuais (ativos e
 * não-visitantes), em vez de somar/subtrair incrementalmente — mais
 * simples e não fica dessincronizado se algo falhar no meio do caminho.
 */
async function recalculateMemberCount(cellId: string) {
  const supabase = createClient();

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("cell_id", cellId)
    .eq("active", true)
    .eq("is_visitor", false);

  await supabase
    .from("cells")
    .update({ member_count: count ?? 0 })
    .eq("id", cellId);
}

/**
 * Cria ou atualiza um membro, dependendo de haver ou não um `id`
 * (hidden input) no formulário. `cell_id` também vem de um hidden input.
 */
export async function saveMember(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireAdminOrSenior();

  const cellId = formData.get("cell_id") as string | null;
  const memberId = (formData.get("id") as string | null) || null;

  if (!cellId) {
    return { error: "Célula inválida." };
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const isVisitor = formData.get("is_visitor") === "on";

  if (!name) {
    return { error: "Informe o nome do membro." };
  }

  if (!phone) {
    return { error: "Informe o telefone do membro." };
  }

  const supabase = createClient();

  if (memberId) {
    const { error } = await supabase
      .from("members")
      .update({ name, phone, is_visitor: isVisitor })
      .eq("id", memberId);

    if (error) {
      return { error: "Não foi possível salvar o membro. Tente novamente." };
    }
  } else {
    const { error } = await supabase.from("members").insert({
      cell_id: cellId,
      name,
      phone,
      is_visitor: isVisitor,
    });

    if (error) {
      return { error: "Não foi possível criar o membro. Tente novamente." };
    }
  }

  await recalculateMemberCount(cellId);

  revalidatePath(`/admin/celulas/${cellId}/membros`);
  revalidatePath("/admin/celulas");
  redirect(`/admin/celulas/${cellId}/membros`);
}

export async function toggleMemberActive(
  cellId: string,
  memberId: string,
  active: boolean
) {
  await requireAdminOrSenior();

  const supabase = createClient();
  await supabase.from("members").update({ active }).eq("id", memberId);

  await recalculateMemberCount(cellId);

  revalidatePath(`/admin/celulas/${cellId}/membros`);
  revalidatePath("/admin/celulas");
}
