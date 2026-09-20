"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";
import { getDefaultChurchId } from "@/lib/data/default-church";

export type CellFormState = { error: string } | null;

/**
 * Cria ou atualiza uma célula, dependendo de haver ou não um `id`
 * (hidden input) no formulário. Usada tanto em /admin/celulas/novo
 * quanto em /admin/celulas/[id]/editar.
 */
export async function saveCell(
  _prevState: CellFormState,
  formData: FormData
): Promise<CellFormState> {
  await requireAdminOrSenior();

  const id = (formData.get("id") as string | null) || null;
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const location = (formData.get("location") as string | null)?.trim() || null;
  const address = (formData.get("address") as string | null)?.trim() || null;
  const leaderId = (formData.get("leader_id") as string | null) || null;
  const active = formData.get("active") === "on";

  if (!name) {
    return { error: "Informe o nome da célula." };
  }

  const supabase = createClient();

  if (id) {
    const { error } = await supabase
      .from("cells")
      .update({ name, location, address, leader_id: leaderId, active })
      .eq("id", id);

    if (error) {
      return { error: "Não foi possível salvar a célula. Tente novamente." };
    }
  } else {
    const churchId = await getDefaultChurchId();

    const { error } = await supabase.from("cells").insert({
      name,
      location,
      address,
      leader_id: leaderId,
      active,
      church_id: churchId,
    });

    if (error) {
      return { error: "Não foi possível criar a célula. Tente novamente." };
    }
  }

  revalidatePath("/admin/celulas");
  redirect("/admin/celulas");
}

export async function toggleCellActive(cellId: string, active: boolean) {
  await requireAdminOrSenior();

  const supabase = createClient();
  await supabase.from("cells").update({ active }).eq("id", cellId);

  revalidatePath("/admin/celulas");
}
