import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateBR } from "@/lib/format";
import { ToggleThemeActiveButton } from "./ToggleThemeActiveButton";

export default async function TemasPage() {
  const supabase = createClient();

  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .order("start_date", { ascending: false, nullsFirst: false });

  const { data: meetings } = await supabase.from("meetings").select("theme_id");

  const meetingCountByTheme = new Map<string, number>();
  for (const meeting of meetings ?? []) {
    meetingCountByTheme.set(
      meeting.theme_id,
      (meetingCountByTheme.get(meeting.theme_id) ?? 0) + 1
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Temas</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ciclos de estudo das células, cada um com suas reuniões.
          </p>
        </div>
        <Button href="/admin/temas/novo" variant="secondary">
          Novo Tema
        </Button>
      </div>

      <Card className="mt-6 overflow-hidden">
        {!themes || themes.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum tema cadastrado ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Título</th>
                <th className="px-6 py-3 font-medium">Vigência</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Reuniões</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {themes.map((theme) => (
                <tr key={theme.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {theme.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDateBR(theme.start_date)} —{" "}
                    {formatDateBR(theme.end_date)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={theme.active ? "success" : "neutral"}>
                      {theme.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {meetingCountByTheme.get(theme.id) ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        href={`/admin/temas/${theme.id}/editar`}
                        variant="outline"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button
                        href={`/admin/temas/${theme.id}/reunioes`}
                        variant="outline"
                        size="sm"
                      >
                        Ver reuniões
                      </Button>
                      <ToggleThemeActiveButton
                        themeId={theme.id}
                        active={theme.active}
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
