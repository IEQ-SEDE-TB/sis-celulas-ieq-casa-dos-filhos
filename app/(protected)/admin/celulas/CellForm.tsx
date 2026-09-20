"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { saveCell, type CellFormState } from "./actions";
import type { Cell } from "@/types/database";

const initialState: CellFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar célula"}
    </Button>
  );
}

export function CellForm({
  cell,
  leaderOptions,
}: {
  cell?: Cell;
  leaderOptions: { id: string; full_name: string }[];
}) {
  const [state, formAction] = useFormState(saveCell, initialState);

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          {cell && <input type="hidden" name="id" value={cell.id} />}

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
              Nome da célula
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={cell?.name ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Localização
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Ex: Bairro Centro"
                defaultValue={cell?.location ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Endereço
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={cell?.address ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="leader_id"
              className="block text-sm font-medium text-gray-700"
            >
              Líder responsável
            </label>
            {leaderOptions.length === 0 ? (
              <p className="mt-1 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Ainda não há nenhum usuário com role &ldquo;leader&rdquo;
                aprovado. A célula pode ser criada sem líder e associada
                depois, assim que houver um líder aprovado.
              </p>
            ) : (
              <select
                id="leader_id"
                name="leader_id"
                defaultValue={cell?.leader_id ?? ""}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="">Sem líder definido</option>
                {leaderOptions.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.full_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={cell?.active ?? true}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Célula ativa
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Button href="/admin/celulas" variant="ghost">
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
