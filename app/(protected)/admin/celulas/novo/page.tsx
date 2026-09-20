import { createClient } from "@/lib/supabase/server";
import { CellForm } from "../CellForm";

export default async function NovaCelulaPage() {
  const supabase = createClient();

  const { data: leaderOptions } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "leader")
    .eq("status", "approved")
    .order("full_name", { ascending: true });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Nova célula</h2>
      <p className="mt-1 text-sm text-gray-500">
        Cadastre uma nova célula da igreja.
      </p>

      <div className="mt-6">
        <CellForm leaderOptions={leaderOptions ?? []} />
      </div>
    </div>
  );
}
