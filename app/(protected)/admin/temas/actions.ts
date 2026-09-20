"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";

export type ThemeFormState = { error: string } | null;

function parseOptionalDate(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

/**
 * Cria ou atualiza um tema, dependendo de haver ou não um `id` (hidden
 * input) no formulário. Usada tanto em /admin/temas/novo quanto em
 * /admin/temas/[id]/editar.
 */
export async function saveTheme(
  _prevState: ThemeFormState,
  formData: FormData
): Promise<ThemeFormState> {
  const profile = await requireAdminOrSenior();

  const id = (formData.get("id") as string | null) || null;
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const startDate = parseOptionalDate(formData.get("start_date"));
  const endDate = parseOptionalDate(formData.get("end_date"));
  const active = formData.get("active") === "on";

  if (!title) {
    return { error: "Informe o título do tema." };
  }

  if (startDate && endDate && endDate <= startDate) {
    return { error: "A data fim deve ser posterior à data início." };
  }

  const supabase = createClient();

  if (id) {
    const { error } = await supabase
      .from("themes")
      .update({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        active,
      })
      .eq("id", id);

    if (error) {
      return { error: "Não foi possível salvar o tema. Tente novamente." };
    }
  } else {
    const { error } = await supabase.from("themes").insert({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      active,
      created_by: profile.id,
    });

    if (error) {
      return { error: "Não foi possível criar o tema. Tente novamente." };
    }
  }

  revalidatePath("/admin/temas");
  redirect("/admin/temas");
}

export async function toggleThemeActive(themeId: string, active: boolean) {
  await requireAdminOrSenior();

  const supabase = createClient();
  await supabase.from("themes").update({ active }).eq("id", themeId);

  revalidatePath("/admin/temas");
}
