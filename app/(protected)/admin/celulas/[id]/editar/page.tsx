import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CellForm } from "../../CellForm";

export default async function EditarCelulaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: cell } = await supabase
    .from("cells")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!cell) {
    notFound();
  }

  const { data: leaderOptions } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "leader")
    .eq("status", "approved")
    .order("full_name", { ascending: true });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Editar célula</h2>
      <p className="mt-1 text-sm text-gray-500">{cell.name}</p>

      <div className="mt-6">
        <CellForm cell={cell} leaderOptions={leaderOptions ?? []} />
      </div>
    </div>
  );
}
