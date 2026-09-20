"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { updateFullName, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction] = useFormState(updateFullName, initialState);

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              Nome atualizado com sucesso.
            </p>
          )}

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              defaultValue={fullName}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <SubmitButton />
        </form>
      </CardBody>
    </Card>
  );
}
