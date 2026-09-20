import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressDot } from "@/components/admin/ProgressDot";
import { computeCellProgressStatus } from "@/lib/data/cell-progress";
import { formatDateBR } from "@/lib/format";
import type { Meeting, MeetingRecord, Theme } from "@/types/database";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { tema?: string; status?: string };
}) {
  await requireAdminOrSenior();

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: cellsData } = await supabase
    .from("cells")
    .select("*")
    .order("name", { ascending: true });
  const cells = cellsData ?? [];

  const { data: themesData } = await supabase
    .from("themes")
    .select("*")
    .order("start_date", { ascending: false, nullsFirst: false });
  const themes = themesData ?? [];

  const { data: approvedLeaders } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "leader")
    .eq("status", "approved");
  const totalApprovedLeaders = approvedLeaders?.length ?? 0;

  const leaderIds = Array.from(
    new Set(cells.map((cell) => cell.leader_id).filter(Boolean))
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

  // "Tema ativo agora" (para as métricas do topo) é calculado, não
  // depende do filtro escolhido pelo admin na tabela de células abaixo.
  const currentActiveTheme =
    themes.find(
      (theme) =>
        theme.active &&
        theme.start_date &&
        theme.end_date &&
        theme.start_date <= today &&
        today <= theme.end_date
    ) ?? null;

  const temaParam = searchParams.tema;
  const selectedTheme: Theme | null =
    (temaParam ? themes.find((theme) => theme.id === temaParam) : undefined) ??
    currentActiveTheme ??
    null;

  const cellIds = cells.map((cell) => cell.id);

  async function getMeetingsAndRecords(themeId: string) {
    const { data: meetingsData } = await supabase
      .from("meetings")
      .select("*")
      .eq("theme_id", themeId)
      .order("meeting_number", { ascending: true });
    const meetings = meetingsData ?? [];

    let records: MeetingRecord[] = [];
    if (meetings.length > 0 && cellIds.length > 0) {
      const { data: recordsData } = await supabase
        .from("meeting_records")
        .select("*")
        .in("cell_id", cellIds)
        .in(
          "meeting_id",
          meetings.map((meeting) => meeting.id)
        );
      records = recordsData ?? [];
    }
    return { meetings, records };
  }

  const activeThemeData = currentActiveTheme
    ? await getMeetingsAndRecords(currentActiveTheme.id)
    : { meetings: [] as Meeting[], records: [] as MeetingRecord[] };

  const selectedThemeData =
    selectedTheme && selectedTheme.id === currentActiveTheme?.id
      ? activeThemeData
      : selectedTheme
        ? await getMeetingsAndRecords(selectedTheme.id)
        : { meetings: [] as Meeting[], records: [] as MeetingRecord[] };

  // Métricas do topo: só células ativas contam para "reuniões
  // realizadas/pendentes/atrasadas/visitantes", já que uma célula
  // inativa não está se reunindo.
  const activeCells = cells.filter((cell) => cell.active);
  const activeCellIds = new Set(activeCells.map((cell) => cell.id));

  const activeThemeRecordsForActiveCells = activeThemeData.records.filter((record) =>
    activeCellIds.has(record.cell_id)
  );
  const doneRecordsActiveTheme = activeThemeRecordsForActiveCells.filter(
    (record) => record.status === "done"
  );
  const doneKeySet = new Set(
    doneRecordsActiveTheme.map((record) => `${record.cell_id}|${record.meeting_id}`)
  );

  let pendingCount = 0;
  let lateCount = 0;
  if (currentActiveTheme) {
    for (const cell of activeCells) {
      for (const meeting of activeThemeData.meetings) {
        if (doneKeySet.has(`${cell.id}|${meeting.id}`)) continue;
        if (!currentActiveTheme.end_date || today <= currentActiveTheme.end_date) {
          pendingCount += 1;
        } else {
          lateCount += 1;
        }
      }
    }
  }

  const totalVisitorsActiveTheme = doneRecordsActiveTheme.reduce(
    (sum, record) => sum + record.visitors_count,
    0
  );

  const totalMembers = cells.reduce((sum, cell) => sum + cell.member_count, 0);

  // Progresso por célula na tabela: usa o tema selecionado no filtro.
  const doneCountByCell = new Map<string, number>();
  for (const record of selectedThemeData.records) {
    if (record.status !== "done") continue;
    doneCountByCell.set(record.cell_id, (doneCountByCell.get(record.cell_id) ?? 0) + 1);
  }

  const statusFilter = searchParams.status;
  const filteredCells = cells.filter((cell) => {
    if (statusFilter === "ativa") return cell.active;
    if (statusFilter === "inativa") return !cell.active;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Visão consolidada de células, líderes e temas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Células ativas" value={String(activeCells.length)} />
        <StatCard
          label="Membros ativos"
          value={String(totalMembers)}
          hint="em todas as células"
        />
        <StatCard label="Líderes aprovados" value={String(totalApprovedLeaders)} />
        {currentActiveTheme && (
          <>
            <StatCard
              label="Reuniões realizadas"
              value={String(doneRecordsActiveTheme.length)}
              hint="no tema atual"
            />
            <StatCard
              label="Pendentes / Atrasadas"
              value={`${pendingCount} / ${lateCount}`}
              hint="no tema atual"
            />
            <StatCard
              label="Visitantes recebidos"
              value={String(totalVisitorsActiveTheme)}
              hint="no tema atual"
            />
          </>
        )}
      </div>

      {!currentActiveTheme && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nenhum tema ativo no momento. As métricas de reuniões deste
          ciclo aparecem aqui assim que um tema for ativado — mas você
          ainda pode ver as células abaixo e, pelo filtro de tema,
          revisar o progresso de um ciclo anterior.
        </p>
      )}

      <Card>
        <form method="GET" className="flex flex-wrap items-end gap-4 px-6 py-4">
          <div>
            <label
              htmlFor="tema"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Tema
            </label>
            <select
              id="tema"
              name="tema"
              defaultValue={selectedTheme?.id ?? ""}
              className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Nenhum tema selecionado</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                  {theme.start_date && theme.end_date
                    ? ` (${formatDateBR(theme.start_date)} – ${formatDateBR(theme.end_date)})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Status da célula
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter ?? ""}
              className="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Todas</option>
              <option value="ativa">Ativas</option>
              <option value="inativa">Inativas</option>
            </select>
          </div>

          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Células — Visão Geral
        </h3>
        <Card className="mt-3 overflow-hidden">
          {filteredCells.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-500">
              Nenhuma célula encontrada com esse filtro.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Célula</th>
                  <th className="px-6 py-3 font-medium">Líder</th>
                  <th className="px-6 py-3 font-medium">Membros</th>
                  <th className="px-6 py-3 font-medium">
                    Reuniões {selectedTheme ? `— ${selectedTheme.title}` : ""}
                  </th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCells.map((cell) => {
                  const totalMeetings = selectedTheme
                    ? selectedThemeData.meetings.length
                    : 0;
                  const doneCount = doneCountByCell.get(cell.id) ?? 0;
                  const progressStatus = selectedTheme
                    ? computeCellProgressStatus({
                        today,
                        themeStartDate: selectedTheme.start_date,
                        themeEndDate: selectedTheme.end_date,
                        totalMeetings,
                        doneCount,
                      })
                    : "none";

                  return (
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
                        {cell.member_count}
                      </td>
                      <td className="px-6 py-4">
                        {selectedTheme ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">
                              {doneCount}/{totalMeetings}
                            </span>
                            <ProgressDot status={progressStatus} />
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Selecione um tema
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={cell.active ? "success" : "neutral"}>
                          {cell.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          href={`/admin/celulas/${cell.id}/membros`}
                          variant="outline"
                          size="sm"
                        >
                          Ver detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
