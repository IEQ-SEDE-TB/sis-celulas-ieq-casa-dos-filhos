import { redirect } from "next/navigation";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { LeaderCellForm } from "./LeaderCellForm";

export default async function NovaCelulaLiderPage() {
  const profile = await requireLeader();
  const existingCell = await getLeaderCell(profile.id);

  if (existingCell) {
    redirect("/lider/dashboard");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">
        Cadastre sua célula
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Antes de acessar seu dashboard, cadastre a célula que você lidera.
        Você poderá adicionar os membros depois.
      </p>

      <div className="mt-6">
        <LeaderCellForm />
      </div>
    </div>
  );
}
