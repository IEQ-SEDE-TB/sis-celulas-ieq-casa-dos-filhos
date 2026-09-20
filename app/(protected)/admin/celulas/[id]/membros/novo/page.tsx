import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "../MemberForm";

export default async function NovoMembroPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: cell } = await supabase
    .from("cells")
    .select("id, name")
    .eq("id", params.id)
    .maybeSingle();

  if (!cell) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Novo membro</h2>
      <p className="mt-1 text-sm text-gray-500">{cell.name}</p>

      <div className="mt-6">
        <MemberForm cellId={cell.id} />
      </div>
    </div>
  );
}
