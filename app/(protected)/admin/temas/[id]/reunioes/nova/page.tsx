import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeetingForm } from "../MeetingForm";

export default async function NovaReuniaoPage({
  params,
}: {
  params: { id: string };
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

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Nova reunião</h2>
      <p className="mt-1 text-sm text-gray-500">{theme.title}</p>

      <div className="mt-6">
        <MeetingForm themeId={theme.id} />
      </div>
    </div>
  );
}
