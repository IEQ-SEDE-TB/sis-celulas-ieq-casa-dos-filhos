import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ToggleMemberActiveButton } from "./ToggleMemberActiveButton";

export default async function MembrosPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: cell } = await supabase
    .from("cells")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!cell) {
    notFound();
  }

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("cell_id", params.id)
    .order("name", { ascending: true });

  return (
    <div>
      <Button href="/admin/celulas" variant="ghost" size="sm">
        ← Voltar para Células
      </Button>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Membros — {cell.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {cell.member_count} membro{cell.member_count === 1 ? "" : "s"} ativo
            {cell.member_count === 1 ? "" : "s"} (não contando visitantes).
          </p>
        </div>
        <Button
          href={`/admin/celulas/${cell.id}/membros/novo`}
          variant="secondary"
        >
          Novo Membro
        </Button>
      </div>

      <Card className="mt-6 overflow-hidden">
        {!members || members.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum membro cadastrado nesta célula ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Telefone</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {member.name}
                      {member.is_visitor && (
                        <Badge variant="warning">Visitante</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {member.phone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.active ? "success" : "neutral"}>
                      {member.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        href={`/admin/celulas/${cell.id}/membros/${member.id}/editar`}
                        variant="outline"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <ToggleMemberActiveButton
                        cellId={cell.id}
                        memberId={member.id}
                        active={member.active}
                      />
                    </div>
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
