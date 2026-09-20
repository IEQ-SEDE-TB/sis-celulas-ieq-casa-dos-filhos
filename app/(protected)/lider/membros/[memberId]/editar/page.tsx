import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { LeaderMemberForm } from "../../LeaderMemberForm";

export default async function EditarMembroLiderPage({
  params,
}: {
  params: { memberId: string };
}) {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    redirect("/lider/celula/nova");
  }

  const supabase = createClient();

  // O `.eq("cell_id", cell.id)` garante que o líder só consiga abrir
  // (e depois editar) um membro da PRÓPRIA célula — um id de membro de
  // outra célula simplesmente não é encontrado aqui.
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", params.memberId)
    .eq("cell_id", cell.id)
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
        <LeaderMemberForm member={member} />
      </div>
    </div>
  );
}
