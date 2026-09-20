import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrSenior } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTimestampBR } from "@/lib/format";
import { UserRowActions } from "./UserRowActions";
import type { ProfileStatus, UserRole } from "@/types/database";

const STATUS_OPTIONS: { value: ProfileStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "blocked", label: "Bloqueados" },
];

const ROLE_OPTIONS: { value: UserRole | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "leader", label: "Líder" },
  { value: "senior", label: "Sênior" },
  { value: "admin", label: "Admin" },
];

const STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  blocked: "Bloqueado",
};

const ROLE_LABELS: Record<UserRole, string> = {
  leader: "Líder",
  senior: "Sênior",
  admin: "Admin",
};

function statusBadgeVariant(status: ProfileStatus) {
  if (status === "approved") return "success" as const;
  if (status === "blocked") return "danger" as const;
  return "warning" as const;
}

function buildFilterHref(
  current: { status?: string; role?: string },
  next: { status?: string; role?: string }
) {
  const params = new URLSearchParams();
  const status = next.status ?? current.status;
  const role = next.role ?? current.role;

  if (status && status !== "todos") params.set("status", status);
  if (role && role !== "todos") params.set("role", role);

  const query = params.toString();
  return `/admin/usuarios${query ? `?${query}` : ""}`;
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: { status?: string; role?: string };
}) {
  const acting = await requireAdminOrSenior();

  const statusFilter =
    searchParams.status && searchParams.status in STATUS_LABELS
      ? (searchParams.status as ProfileStatus)
      : undefined;
  const roleFilter =
    searchParams.role && searchParams.role in ROLE_LABELS
      ? (searchParams.role as UserRole)
      : undefined;

  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  const { data: profiles } = await query;

  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Usuários</h2>
        <p className="mt-1 text-sm text-gray-500">
          Aprove, gerencie roles e bloqueie usuários que fizeram login com
          o Google.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Status
          </span>
          <div className="mt-1 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={buildFilterHref(searchParams, { status: option.value })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  (searchParams.status ?? "todos") === option.value
                    ? "bg-secondary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Role
          </span>
          <div className="mt-1 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={buildFilterHref(searchParams, { role: option.value })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  (searchParams.role ?? "todos") === option.value
                    ? "bg-secondary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden">
        {!profiles || profiles.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum usuário encontrado com esses filtros.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Criado em</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {profile.full_name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{profile.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{ROLE_LABELS[profile.role]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusBadgeVariant(profile.status)}>
                      {STATUS_LABELS[profile.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatTimestampBR(profile.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <UserRowActions
                      profile={profile}
                      canPromote={acting.role === "admin"}
                      isSelf={profile.id === acting.id}
                    />
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
