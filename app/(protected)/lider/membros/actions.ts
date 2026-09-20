"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { recalculateMemberCount } from "@/lib/data/member-count";

export type MemberFormState = { error: string } | null;

/**
 * Cria ou atualiza um membro da célula do líder logado. A célula é
 * SEMPRE derivada via getLeaderCell(profile.id) — nunca aceita um
 * cell_id vindo do formulário/URL, então não há como o líder mexer em
 * membros de outra célula (mesmo padrão de segurança de
 * /lider/reuniao/[meetingId]).
 */
export async function saveMember(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    return {
      error: "Você ainda não está vinculado a nenhuma célula como líder.",
    };
  }

  const memberId = (formData.get("id") as string | null) || null;
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
    // Confirma que o membro pertence mesmo à célula do líder antes de
    // atualizar — o `.eq("cell_id", cell.id)` some com a linha do
    // update caso alguém tente editar o id de um membro de outra
    // célula (a policy de RLS já bloquearia, isso é defesa extra).
    const { error } = await supabase
      .from("members")
      .update({ name, phone, is_visitor: isVisitor })
      .eq("id", memberId)
      .eq("cell_id", cell.id);

    if (error) {
      return { error: "Não foi possível salvar o membro. Tente novamente." };
    }
  } else {
    const { error } = await supabase.from("members").insert({
      cell_id: cell.id,
      name,
      phone,
      is_visitor: isVisitor,
    });

    if (error) {
      return { error: "Não foi possível criar o membro. Tente novamente." };
    }
  }

  await recalculateMemberCount(cell.id);

  revalidatePath("/lider/membros");
  revalidatePath("/lider/dashboard");
  redirect("/lider/membros");
}

export async function toggleMemberActive(memberId: string, active: boolean) {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    return;
  }

  const supabase = createClient();
  await supabase
    .from("members")
    .update({ active })
    .eq("id", memberId)
    .eq("cell_id", cell.id);

  await recalculateMemberCount(cell.id);

  revalidatePath("/lider/membros");
  revalidatePath("/lider/dashboard");
}
