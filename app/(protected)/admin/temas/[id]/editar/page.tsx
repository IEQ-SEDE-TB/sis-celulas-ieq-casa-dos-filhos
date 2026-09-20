import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeForm } from "../../ThemeForm";

export default async function EditarTemaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!theme) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Editar tema</h2>
      <p className="mt-1 text-sm text-gray-500">{theme.title}</p>

      <div className="mt-6">
        <ThemeForm theme={theme} />
      </div>
    </div>
  );
}
