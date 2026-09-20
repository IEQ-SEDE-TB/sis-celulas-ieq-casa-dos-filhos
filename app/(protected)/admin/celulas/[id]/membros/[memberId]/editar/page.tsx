import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "../../MemberForm";

export default async function EditarMembroPage({
  params,
}: {
  params: { id: string; memberId: string };
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

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", params.memberId)
    .eq("cell_id", params.id)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Editar membro</h2>
      <p className="mt-1 text-sm text-gray-500">
        {member.name} — {cell.name}
      </p>

      <div className="mt-6">
        <MemberForm cellId={cell.id} member={member} />
      </div>
    </div>
  );
}
