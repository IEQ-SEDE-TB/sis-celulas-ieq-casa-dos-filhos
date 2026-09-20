"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { markMeetingDone, type MarkDoneFormState } from "./actions";
import type { MeetingRecord } from "@/types/database";

const initialState: MarkDoneFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function MarkDoneForm({
  meetingId,
  existingRecord,
}: {
  meetingId: string;
  existingRecord?: MeetingRecord;
}) {
  const [state, formAction] = useFormState(markMeetingDone, initialState);

  const defaultDate = existingRecord?.occurred_at
    ? existingRecord.occurred_at.slice(0, 10)
    : todayIso();

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="meeting_id" value={meetingId} />

          {existingRecord?.status === "done" && (
            <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              Esta reunião já foi marcada como realizada. Salvar novamente
              atualiza o registro.
            </p>
          )}

          {state?.error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="occurred_at"
                className="block text-sm font-medium text-gray-700"
              >
                Data
              </label>
              <input
                type="date"
                id="occurred_at"
                name="occurred_at"
                required
                defaultValue={defaultDate}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="attendees_count"
                className="block text-sm font-medium text-gray-700"
              >
                Presentes
              </label>
              <input
                type="number"
                id="attendees_count"
                name="attendees_count"
                min={0}
                step={1}
                required
                defaultValue={existingRecord?.attendees_count ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="visitors_count"
                className="block text-sm font-medium text-gray-700"
              >
                Visitantes
              </label>
              <input
                type="number"
                id="visitors_count"
                name="visitors_count"
                min={0}
                step={1}
                defaultValue={existingRecord?.visitors_count ?? 0}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={existingRecord?.notes ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <SubmitButton />
        </form>
      </CardBody>
    </Card>
  );
}
