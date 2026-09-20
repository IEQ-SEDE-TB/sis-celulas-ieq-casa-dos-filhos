"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";

export type MeetingFormState = { error: string } | null;

function cleanList(values: FormDataEntryValue[]): string[] {
  return values
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
}

function fileOrNull(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * Cria ou atualiza uma reunião de um tema. Dependendo de haver ou não um
 * `id` (hidden input) no formulário, faz insert ou update. `theme_id`
 * também vem de um hidden input.
 */
export async function saveMeeting(
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  await requireAdminOrSenior();

  const themeId = formData.get("theme_id") as string | null;
  const meetingId = (formData.get("id") as string | null) || null;

  if (!themeId) {
    return { error: "Tema inválido." };
  }

  const meetingNumberRaw = (formData.get("meeting_number") as string | null)?.trim();
  const meetingNumber = meetingNumberRaw ? Number(meetingNumberRaw) : NaN;

  if (!Number.isInteger(meetingNumber) || meetingNumber <= 0) {
    return { error: "Informe um número de reunião válido (inteiro positivo)." };
  }

  const dynamicIdea = (formData.get("dynamic_idea") as string | null)?.trim() || null;
  const videoUrl = (formData.get("video_url") as string | null)?.trim() || null;

  const checklist = cleanList(formData.getAll("checklist"));
  const verses = cleanList(formData.getAll("verses"));
  const keyQuestions = cleanList(formData.getAll("key_questions"));

  const pdfFile = fileOrNull(formData.get("pdf"));
  const thumbnailFile = fileOrNull(formData.get("thumbnail"));

  if (pdfFile && pdfFile.type !== "application/pdf") {
    return { error: "O arquivo da pregação precisa ser um PDF." };
  }

  if (thumbnailFile && !thumbnailFile.type.startsWith("image/")) {
    return { error: "A capa do vídeo precisa ser uma imagem." };
  }

  const supabase = createClient();

  // Valida unicidade do número da reunião dentro do tema (checagem
  // amigável; a constraint UNIQUE no banco é a garantia final).
  const { data: existingWithNumber } = await supabase
    .from("meetings")
    .select("id")
    .eq("theme_id", themeId)
    .eq("meeting_number", meetingNumber)
    .maybeSingle();

  if (existingWithNumber && existingWithNumber.id !== meetingId) {
    return {
      error: `Já existe uma reunião número ${meetingNumber} cadastrada neste tema.`,
    };
  }

  const baseFields = {
    theme_id: themeId,
    meeting_number: meetingNumber,
    dynamic_idea: dynamicIdea,
    video_url: videoUrl,
    checklist,
    verses,
    key_questions: keyQuestions,
  };

  let currentMeetingId = meetingId;

  if (currentMeetingId) {
    const { error } = await supabase
      .from("meetings")
      .update(baseFields)
      .eq("id", currentMeetingId);

    if (error) {
      return { error: "Não foi possível salvar a reunião. Tente novamente." };
    }
  } else {
    const { data: inserted, error } = await supabase
      .from("meetings")
      .insert(baseFields)
      .select("id")
      .single();

    if (error || !inserted) {
      if (error?.code === "23505") {
        return {
          error: `Já existe uma reunião número ${meetingNumber} cadastrada neste tema.`,
        };
      }
      return { error: "Não foi possível criar a reunião. Tente novamente." };
    }

    currentMeetingId = inserted.id;
  }

  if (pdfFile) {
    const path = `${currentMeetingId}/pregacao.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("meeting-pdfs")
      .upload(path, pdfFile, { upsert: true, contentType: pdfFile.type });

    if (uploadError) {
      return { error: "Reunião salva, mas o upload do PDF falhou. Tente enviar novamente." };
    }

    const { data: pdfUrlData } = supabase.storage
      .from("meeting-pdfs")
      .getPublicUrl(path);

    await supabase
      .from("meetings")
      .update({ pdf_url: pdfUrlData.publicUrl })
      .eq("id", currentMeetingId);
  }

  if (thumbnailFile) {
    const extension = thumbnailFile.name.split(".").pop() || "jpg";
    const path = `${currentMeetingId}/thumbnail.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("video-thumbnails")
      .upload(path, thumbnailFile, { upsert: true, contentType: thumbnailFile.type });

    if (uploadError) {
      return {
        error: "Reunião salva, mas o upload da capa do vídeo falhou. Tente enviar novamente.",
      };
    }

    const { data: thumbnailUrlData } = supabase.storage
      .from("video-thumbnails")
      .getPublicUrl(path);

    await supabase
      .from("meetings")
      .update({ video_thumbnail_url: thumbnailUrlData.publicUrl })
      .eq("id", currentMeetingId);
  }

  revalidatePath(`/admin/temas/${themeId}/reunioes`);
  redirect(`/admin/temas/${themeId}/reunioes`);
}
