"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { saveTheme, type ThemeFormState } from "./actions";
import type { Theme } from "@/types/database";

const initialState: ThemeFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar tema"}
    </Button>
  );
}

export function ThemeForm({ theme }: { theme?: Theme }) {
  const [state, formAction] = useFormState(saveTheme, initialState);

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          {theme && <input type="hidden" name="id" value={theme.id} />}

          {state?.error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={theme?.title ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={theme?.description ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700"
              >
                Data início
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                defaultValue={theme?.start_date ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium text-gray-700"
              >
                Data fim
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                defaultValue={theme?.end_date ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={theme?.active ?? true}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Tema ativo
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Button href="/admin/temas" variant="ghost">
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
