"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { saveMember, type MemberFormState } from "./actions";
import type { Member } from "@/types/database";

const initialState: MemberFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar membro"}
    </Button>
  );
}

export function LeaderMemberForm({ member }: { member?: Member }) {
  const [state, formAction] = useFormState(saveMember, initialState);

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          {member && <input type="hidden" name="id" value={member.id} />}

          {state?.error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={member?.name ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="(48) 90000-0000"
              defaultValue={member?.phone ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_visitor"
              name="is_visitor"
              defaultChecked={member?.is_visitor ?? false}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_visitor" className="text-sm text-gray-700">
              É visitante
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Button href="/lider/membros" variant="ghost">
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
