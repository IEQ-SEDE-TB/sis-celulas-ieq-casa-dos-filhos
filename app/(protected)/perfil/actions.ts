"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireApprovedUser } from "@/lib/auth/require-role";

export type ProfileFormState = { error?: string; success?: boolean } | null;

/**
 * Atualiza o full_name do PRÓPRIO usuário logado, via a função
 * update_own_full_name (SECURITY DEFINER) no banco. Não usamos um
 * `.update()` direto em `profiles` com uma policy "dono do registro
 * pode atualizar", porque RLS não restringe por coluna: essa policy
 * deixaria qualquer usuário livre para também tentar mudar o próprio
 * role/status via API direta. A função só aceita o novo nome como
 * argumento, então não há como mandar mais nada além disso.
 */
export async function updateFullName(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  await requireApprovedUser();

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";

  if (!fullName) {
    return { error: "Informe seu nome." };
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("update_own_full_name", {
    new_full_name: fullName,
  });

  if (error) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");

  return { success: true };
}
