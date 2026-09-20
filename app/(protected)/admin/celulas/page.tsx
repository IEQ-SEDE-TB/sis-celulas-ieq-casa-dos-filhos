import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ToggleCellActiveButton } from "./ToggleCellActiveButton";

export default async function CelulasPage() {
  const supabase = createClient();

  const { data: cells } = await supabase
    .from("cells")
    .select("*")
    .order("name", { ascending: true });

  const leaderIds = Array.from(
    new Set((cells ?? []).map((cell) => cell.leader_id).filter(Boolean))
  ) as string[];

  const leaderNameById = new Map<string, string>();
  if (leaderIds.length > 0) {
    const { data: leaders } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", leaderIds);

    for (const leader of leaders ?? []) {
      leaderNameById.set(leader.id, leader.full_name);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Células</h2>
          <p className="mt-1 text-sm text-gray-500">
            Células da igreja e seus líderes responsáveis.
          </p>
        </div>
        <Button href="/admin/celulas/novo" variant="secondary">
          Nova Célula
        </Button>
      </div>

      <Card className="mt-6 overflow-hidden">
        {!cells || cells.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhuma célula cadastrada ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Célula</th>
                <th className="px-6 py-3 font-medium">Líder</th>
                <th className="px-6 py-3 font-medium">Localização</th>
                <th className="px-6 py-3 font-medium">Membros ativos</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cells.map((cell) => (
                <tr key={cell.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {cell.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {cell.leader_id
                      ? leaderNameById.get(cell.leader_id) ?? "—"
                      : "Sem líder definido"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {cell.location || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {cell.member_count}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={cell.active ? "success" : "neutral"}>
                      {cell.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        href={`/admin/celulas/${cell.id}/editar`}
                        variant="outline"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button
                        href={`/admin/celulas/${cell.id}/membros`}
                        variant="outline"
                        size="sm"
                      >
                        Ver membros
                      </Button>
                      <ToggleCellActiveButton
                        cellId={cell.id}
                        active={cell.active}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
