"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import {
  approveAsLeader,
  updateUserStatus,
  changeUserRole,
  type RoleFormState,
} from "./actions";
import type { Profile, UserRole } from "@/types/database";

const ROLE_LABELS: Record<UserRole, string> = {
  leader: "Líder",
  senior: "Sênior",
  admin: "Admin",
};

const roleFormInitialState: RoleFormState = null;

function RoleSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

function RoleSelectForm({
  profile,
  canPromote,
}: {
  profile: Profile;
  canPromote: boolean;
}) {
  const [state, formAction] = useFormState(changeUserRole, roleFormInitialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="profile_id" value={profile.id} />
      <select
        name="role"
        defaultValue={profile.role}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-gray-500 focus:outline-none"
      >
        <option value="leader">Líder</option>
        <option value="senior" disabled={!canPromote}>
          Sênior
        </option>
        <option value="admin" disabled={!canPromote}>
          Admin
        </option>
      </select>
      <RoleSubmitButton />
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

function StatusActionButton({
  label,
  pendingLabel,
  onRun,
  variant = "outline",
}: {
  label: string;
  pendingLabel: string;
  onRun: () => Promise<void>;
  variant?: "outline" | "danger" | "secondary";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          onRun();
        });
      }}
    >
      {isPending ? pendingLabel : label}
    </Button>
  );
}

export function UserRowActions({
  profile,
  canPromote,
  isSelf,
}: {
  profile: Profile;
  canPromote: boolean;
  isSelf: boolean;
}) {
  if (isSelf) {
    return (
      <span className="text-xs text-gray-400">
        Você (não é possível alterar o próprio usuário aqui)
      </span>
    );
  }

  if (profile.status === "pending") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <StatusActionButton
          label="Aprovar como Líder"
          pendingLabel="Aprovando..."
          variant="secondary"
          onRun={() => approveAsLeader(profile.id)}
        />
        <StatusActionButton
          label="Rejeitar"
          pendingLabel="Rejeitando..."
          variant="danger"
          onRun={() => updateUserStatus(profile.id, "blocked")}
        />
      </div>
    );
  }

  if (profile.status === "approved") {
    // Alvo já é senior/admin e quem está agindo não pode promover:
    // não mostra o select (evita "resetar" a role sem querer, já que o
    // valor atual não estaria entre as opções habilitadas).
    const roleLocked = !canPromote && profile.role !== "leader";

    return (
      <div className="flex flex-wrap items-center gap-3">
        {roleLocked ? (
          <span className="text-xs text-gray-500">
            Role: {ROLE_LABELS[profile.role]} (só um admin altera)
          </span>
        ) : (
          <RoleSelectForm profile={profile} canPromote={canPromote} />
        )}
        <StatusActionButton
          label="Bloquear"
          pendingLabel="Bloqueando..."
          variant="danger"
          onRun={() => updateUserStatus(profile.id, "blocked")}
        />
      </div>
    );
  }

  return (
    <StatusActionButton
      label="Reativar"
      pendingLabel="Reativando..."
      variant="secondary"
      onRun={() => updateUserStatus(profile.id, "approved")}
    />
  );
}
