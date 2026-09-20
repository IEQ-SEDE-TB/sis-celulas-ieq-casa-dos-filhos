import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ReunioesPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!theme) {
    notFound();
  }

  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("theme_id", params.id)
    .order("meeting_number", { ascending: true });

  return (
    <div>
      <Button href="/admin/temas" variant="ghost" size="sm">
        ← Voltar para Temas
      </Button>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reuniões — {theme.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Conteúdo cadastrado para cada reunião deste tema.
          </p>
        </div>
        <Button
          href={`/admin/temas/${theme.id}/reunioes/nova`}
          variant="secondary"
        >
          Nova Reunião
        </Button>
      </div>

      <Card className="mt-6 overflow-hidden">
        {!meetings || meetings.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhuma reunião cadastrada para este tema ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Reunião</th>
                <th className="px-6 py-3 font-medium">PDF da pregação</th>
                <th className="px-6 py-3 font-medium">Vídeo</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {meetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Reunião {meeting.meeting_number}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={meeting.pdf_url ? "success" : "neutral"}>
                      {meeting.pdf_url ? "Anexado" : "Sem PDF"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={meeting.video_url ? "success" : "neutral"}>
                      {meeting.video_url ? "Anexado" : "Sem vídeo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      href={`/admin/temas/${theme.id}/reunioes/${meeting.id}/editar`}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
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
