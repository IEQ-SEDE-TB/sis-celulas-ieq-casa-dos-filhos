"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";

export type MarkDoneFormState = { error: string } | null;

/**
 * Marca uma reunião como realizada (cria ou atualiza o meeting_record).
 * A célula usada é SEMPRE a do líder logado (via getLeaderCell) — nunca
 * um cell_id vindo do formulário/URL, então não há como marcar uma
 * reunião "em nome" de outra célula.
 */
export async function markMeetingDone(
  _prevState: MarkDoneFormState,
  formData: FormData
): Promise<MarkDoneFormState> {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    return {
      error: "Você ainda não está vinculado a nenhuma célula como líder.",
    };
  }

  const meetingId = formData.get("meeting_id") as string | null;
  if (!meetingId) {
    return { error: "Reunião inválida." };
  }

  const supabase = createClient();

  // Confirma que a reunião existe de fato (e que o líder tem permissão de
  // lê-la, via RLS) antes de gravar qualquer coisa — não confia apenas no
  // id que veio do formulário.
  const { data: meeting } = await supabase
    .from("meetings")
    .select("id")
    .eq("id", meetingId)
    .maybeSingle();

  if (!meeting) {
    return { error: "Reunião não encontrada." };
  }

  const occurredAt = (formData.get("occurred_at") as string | null) || "";
  const attendeesRaw = (formData.get("attendees_count") as string | null)?.trim();
  const visitorsRaw = (formData.get("visitors_count") as string | null)?.trim();
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  if (!occurredAt) {
    return { error: "Informe a data da reunião." };
  }

  const attendeesCount = attendeesRaw ? Number(attendeesRaw) : NaN;
  const visitorsCount = visitorsRaw ? Number(visitorsRaw) : 0;

  if (!Number.isInteger(attendeesCount) || attendeesCount < 0) {
    return {
      error: "Informe a quantidade de presentes (número inteiro, 0 ou mais).",
    };
  }

  if (!Number.isInteger(visitorsCount) || visitorsCount < 0) {
    return {
      error: "Informe a quantidade de visitantes (número inteiro, 0 ou mais).",
    };
  }

  const { error } = await supabase.from("meeting_records").upsert(
    {
      cell_id: cell.id,
      meeting_id: meetingId,
      occurred_at: occurredAt,
      status: "done",
      attendees_count: attendeesCount,
      visitors_count: visitorsCount,
      notes,
    },
    { onConflict: "cell_id,meeting_id" }
  );

  if (error) {
    return { error: "Não foi possível salvar o registro. Tente novamente." };
  }

  revalidatePath(`/lider/reuniao/${meetingId}`);
  revalidatePath("/lider/dashboard");
  redirect("/lider/dashboard");
}
