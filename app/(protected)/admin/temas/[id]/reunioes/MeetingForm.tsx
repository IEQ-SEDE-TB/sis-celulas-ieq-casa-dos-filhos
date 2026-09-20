"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { DynamicStringList } from "@/components/admin/DynamicStringList";
import { saveMeeting, type MeetingFormState } from "./actions";
import type { Meeting } from "@/types/database";

const initialState: MeetingFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar reunião"}
    </Button>
  );
}

export function MeetingForm({
  themeId,
  meeting,
}: {
  themeId: string;
  meeting?: Meeting;
}) {
  const [state, formAction] = useFormState(saveMeeting, initialState);

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="theme_id" value={themeId} />
          {meeting && <input type="hidden" name="id" value={meeting.id} />}

          {state?.error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div>
            <label
              htmlFor="meeting_number"
              className="block text-sm font-medium text-gray-700"
            >
              Número da reunião
            </label>
            <input
              type="number"
              id="meeting_number"
              name="meeting_number"
              min={1}
              step={1}
              required
              defaultValue={meeting?.meeting_number ?? ""}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="pdf"
              className="block text-sm font-medium text-gray-700"
            >
              PDF da pregação
            </label>
            {meeting?.pdf_url && (
              <a
                href={meeting.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm text-secondary-700 underline"
              >
                Ver PDF atual
              </a>
            )}
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept="application/pdf"
              className="mt-1 block w-full text-sm text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-400">
              {meeting?.pdf_url
                ? "Envie um novo arquivo para substituir o atual."
                : "Opcional."}
            </p>
          </div>

          <DynamicStringList
            name="checklist"
            label="Checklist de pontos-chave"
            placeholder="Ex: Abertura com oração"
            initialValues={meeting?.checklist ?? undefined}
          />

          <DynamicStringList
            name="verses"
            label="Versículos"
            placeholder="Ex: João 3:16"
            initialValues={meeting?.verses ?? undefined}
          />

          <div>
            <label
              htmlFor="dynamic_idea"
              className="block text-sm font-medium text-gray-700"
            >
              Ideia de dinâmica
            </label>
            <textarea
              id="dynamic_idea"
              name="dynamic_idea"
              rows={4}
              defaultValue={meeting?.dynamic_idea ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <DynamicStringList
            name="key_questions"
            label="Perguntas-chave / desafio final"
            placeholder="Ex: O que você aprendeu hoje?"
            initialValues={meeting?.key_questions ?? undefined}
          />

          <div>
            <label
              htmlFor="video_url"
              className="block text-sm font-medium text-gray-700"
            >
              Link do vídeo (opcional)
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              placeholder="https://..."
              defaultValue={meeting?.video_url ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-700"
            >
              Capa do vídeo (opcional)
            </label>
            {meeting?.video_thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meeting.video_thumbnail_url}
                alt="Capa atual do vídeo"
                className="mt-2 h-24 rounded-md border border-gray-200 object-cover"
              />
            )}
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Button href={`/admin/temas/${themeId}/reunioes`} variant="ghost">
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
