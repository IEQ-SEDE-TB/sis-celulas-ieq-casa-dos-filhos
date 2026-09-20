"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";
import type { ProfileStatus, UserRole } from "@/types/database";

const VALID_ROLES: UserRole[] = ["leader", "senior", "admin"];

/**
 * Nenhuma ação deste módulo pode ser aplicada ao próprio usuário logado
 * — evita se autobloquear ou se rebaixar sem querer pela tela.
 */
function assertNotSelf(actingProfileId: string, targetProfileId: string) {
  if (actingProfileId === targetProfileId) {
    throw new Error("Você não pode alterar o próprio usuário por esta tela.");
  }
}

/**
 * Aprova um usuário "pending" diretamente como líder (única forma de
 * aprovação por aqui — promover para senior/admin é feito depois, via
 * changeUserRole, e só por um admin).
 */
export async function approveAsLeader(targetProfileId: string) {
  const acting = await requireAdminOrSenior();
  assertNotSelf(acting.id, targetProfileId);

  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ status: "approved", role: "leader" })
    .eq("id", targetProfileId);

  revalidatePath("/admin/usuarios");
}

/**
 * Usada tanto para "Rejeitar" (pending -> blocked), "Bloquear"
 * (approved -> blocked) quanto "Reativar" (blocked -> approved).
 */
export async function updateUserStatus(
  targetProfileId: string,
  status: ProfileStatus
) {
  const acting = await requireAdminOrSenior();
  assertNotSelf(acting.id, targetProfileId);

  const supabase = createClient();
  await supabase.from("profiles").update({ status }).eq("id", targetProfileId);

  revalidatePath("/admin/usuarios");
}

export type RoleFormState = { error: string } | null;

export async function changeUserRole(
  _prevState: RoleFormState,
  formData: FormData
): Promise<RoleFormState> {
  const acting = await requireAdminOrSenior();

  const targetProfileId = formData.get("profile_id") as string | null;
  const newRole = formData.get("role") as UserRole | null;

  if (!targetProfileId || !newRole || !VALID_ROLES.includes(newRole)) {
    return { error: "Dados inválidos." };
  }

  if (targetProfileId === acting.id) {
    return { error: "Você não pode alterar o próprio role por esta tela." };
  }

  if ((newRole === "admin" || newRole === "senior") && acting.role !== "admin") {
    return {
      error: "Só um administrador pode promover alguém para admin ou senior.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetProfileId);

  if (error) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/admin/usuarios");
  return null;
}
