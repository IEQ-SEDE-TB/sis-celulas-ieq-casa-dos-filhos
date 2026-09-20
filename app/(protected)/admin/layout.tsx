import { requireAdminOrSenior } from "@/lib/auth/require-role";
import { AreaHeader } from "@/components/layout/AreaHeader";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/temas", label: "Temas" },
  { href: "/admin/celulas", label: "Células" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checagem server-side: só admin/senior aprovados chegam aqui. Feita no
  // layout para cobrir todas as rotas de /admin de uma vez só — mas cada
  // Server Action deste módulo repete a checagem, pois uma Server Action
  // não passa pela árvore de layouts ao ser invocada.
  await requireAdminOrSenior();

  return (
    <div className="min-h-screen bg-gray-50">
      <AreaHeader
        variant="admin"
        eyebrow="Painel administrativo"
        navItems={NAV_ITEMS}
      />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
