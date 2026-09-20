import { redirect } from "next/navigation";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { LeaderMemberForm } from "../LeaderMemberForm";

export default async function NovoMembroLiderPage() {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    redirect("/lider/celula/nova");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Novo membro</h2>
      <p className="mt-1 text-sm text-gray-500">{cell.name}</p>

      <div className="mt-6">
        <LeaderMemberForm />
      </div>
    </div>
  );
}
