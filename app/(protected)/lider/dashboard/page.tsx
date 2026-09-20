import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { Card, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { StatusDot, type MeetingDotStatus } from "@/components/lider/StatusDot";
import type { Meeting, MeetingRecord } from "@/types/database";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default async function LiderDashboardPage() {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  if (!cell) {
    return (
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900">
            Nenhuma célula vinculada
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Seu usuário ainda não está vinculado a nenhuma célula como
            líder. Fale com um administrador para que ele associe seu
            usuário a uma célula.
          </p>
        </CardBody>
      </Card>
    );
  }

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: activeThemes } = await supabase
    .from("themes")
    .select("*")
    .eq("active", true)
    .order("start_date", { ascending: false, nullsFirst: false })
    .limit(1);

  const activeTheme = activeThemes?.[0] ?? null;

  let meetings: Meeting[] = [];
  let records: MeetingRecord[] = [];

  if (activeTheme) {
    const { data: meetingsData } = await supabase
      .from("meetings")
      .select("*")
      .eq("theme_id", activeTheme.id)
      .order("meeting_number", { ascending: true });
    meetings = meetingsData ?? [];

    if (meetings.length > 0) {
      const { data: recordsData } = await supabase
        .from("meeting_records")
        .select("*")
        .eq("cell_id", cell.id)
        .in(
          "meeting_id",
          meetings.map((m) => m.id)
        );
      records = recordsData ?? [];
    }
  }

  const recordByMeetingId = new Map(records.map((r) => [r.meeting_id, r]));

  function statusFor(meeting: Meeting): MeetingDotStatus {
    const record = recordByMeetingId.get(meeting.id);
    if (record?.status === "done") return "done";
    if (!activeTheme?.end_date || today <= activeTheme.end_date) return "pending";
    return "late";
  }

  const doneRecords = records.filter((r) => r.status === "done");
  const pendingCount = meetings.filter((m) => statusFor(m) === "pending").length;
  const lateCount = meetings.filter((m) => statusFor(m) === "late").length;
  const avgAttendance = average(doneRecords.map((r) => r.attendees_count));
  const totalVisitors = doneRecords.reduce((sum, r) => sum + r.visitors_count, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold text-gray-900">{cell.name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {cell.location || "Localização não informada"}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {cell.member_count} membro{cell.member_count === 1 ? "" : "s"} ativo
            {cell.member_count === 1 ? "" : "s"}
          </p>
        </CardBody>
      </Card>

      {activeTheme ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Reuniões realizadas"
              value={String(doneRecords.length)}
              hint={`de ${meetings.length} no tema atual`}
            />
            <StatCard
              label="Pendentes / Atrasadas"
              value={`${pendingCount} / ${lateCount}`}
            />
            <StatCard
              label="Frequência média"
              value={avgAttendance === null ? "—" : avgAttendance.toFixed(1)}
              hint="presentes por reunião"
            />
            <StatCard
              label="Visitantes recebidos"
              value={String(totalVisitors)}
              hint="no tema atual"
            />
            <StatCard
              label="Membros na célula"
              value={String(cell.member_count)}
              hint="histórico ainda não disponível"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Reuniões — {activeTheme.title}
            </h3>
            <Card className="mt-3 overflow-hidden">
              {meetings.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-gray-500">
                  Nenhuma reunião cadastrada para o tema atual ainda.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {meetings.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          Reunião {meeting.meeting_number}
                        </span>
                        <StatusDot status={statusFor(meeting)} />
                      </div>
                      <Button
                        href={`/lider/reuniao/${meeting.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Ver conteúdo
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:w-64">
            <StatCard
              label="Membros na célula"
              value={String(cell.member_count)}
              hint="histórico ainda não disponível"
            />
          </div>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">
                Nenhum tema ativo no momento, aguarde o próximo ciclo.
              </p>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
