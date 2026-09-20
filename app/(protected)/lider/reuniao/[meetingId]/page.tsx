import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireLeader } from "@/lib/auth/require-role";
import { getLeaderCell } from "@/lib/data/leader-cell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MarkDoneForm } from "./MarkDoneForm";

export default async function ReuniaoConteudoPage({
  params,
}: {
  params: { meetingId: string };
}) {
  const profile = await requireLeader();
  const cell = await getLeaderCell(profile.id);

  // Sem célula vinculada não há como validar "é a célula deste líder", e
  // o dashboard já explica esse estado — manda pra lá em vez de tentar
  // renderizar uma reunião "solta".
  if (!cell) {
    redirect("/lider/dashboard");
  }

  const supabase = createClient();

  // A leitura já é filtrada por RLS (líder só enxerga reuniões de temas
  // ativos); se o id não existir ou não for visível, cai no notFound().
  const { data: meeting } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", params.meetingId)
    .maybeSingle();

  if (!meeting) {
    notFound();
  }

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("id", meeting.theme_id)
    .maybeSingle();

  const { data: existingRecord } = await supabase
    .from("meeting_records")
    .select("*")
    .eq("cell_id", cell.id)
    .eq("meeting_id", meeting.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Button href="/lider/dashboard" variant="ghost" size="sm">
        ← Voltar para o Dashboard
      </Button>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Reunião {meeting.meeting_number}
        </h2>
        {theme && <p className="mt-1 text-sm text-gray-500">{theme.title}</p>}
      </div>

      <Card>
        <CardBody className="space-y-6">
          {meeting.pdf_url && (
            <a
              href={meeting.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button type="button" variant="primary">
                Baixar PDF da Pregação
              </Button>
            </a>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Checklist de pontos-chave
            </h3>
            {meeting.checklist && meeting.checklist.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {meeting.checklist.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                Nenhum item cadastrado.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Versículos
            </h3>
            {meeting.verses && meeting.verses.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {meeting.verses.map((verse, index) => (
                  <li key={index}>{verse}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                Nenhum versículo cadastrado.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Ideia de dinâmica
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {meeting.dynamic_idea || "Nenhuma dinâmica cadastrada."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Perguntas-chave / desafio final
            </h3>
            {meeting.key_questions && meeting.key_questions.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {meeting.key_questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                Nenhuma pergunta cadastrada.
              </p>
            )}
          </div>

          {meeting.video_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Vídeo</h3>
              <a
                href={meeting.video_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block"
              >
                {meeting.video_thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meeting.video_thumbnail_url}
                    alt="Abrir vídeo"
                    className="h-32 rounded-md border border-gray-200 object-cover"
                  />
                ) : (
                  <span className="text-sm text-primary-700 underline">
                    Assistir vídeo
                  </span>
                )}
              </a>
            </div>
          )}
        </CardBody>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Marcar reunião como realizada
        </h3>
        <div className="mt-3">
          <MarkDoneForm
            meetingId={meeting.id}
            existingRecord={existingRecord ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
