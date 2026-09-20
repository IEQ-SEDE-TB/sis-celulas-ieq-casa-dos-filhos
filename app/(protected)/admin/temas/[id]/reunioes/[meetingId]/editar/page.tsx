import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeetingForm } from "../../MeetingForm";

export default async function EditarReuniaoPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  const supabase = createClient();

  const { data: theme } = await supabase
    .from("themes")
    .select("id, title")
    .eq("id", params.id)
    .maybeSingle();

  if (!theme) {
    notFound();
  }

  const { data: meeting } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", params.meetingId)
    .eq("theme_id", params.id)
    .maybeSingle();

  if (!meeting) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">
        Editar reunião {meeting.meeting_number}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{theme.title}</p>

      <div className="mt-6">
        <MeetingForm themeId={theme.id} meeting={meeting} />
      </div>
    </div>
  );
}
