import { requireLeader } from "@/lib/auth/require-role";
import { AreaHeader } from "@/components/layout/AreaHeader";

const NAV_ITEMS = [
  { href: "/lider/dashboard", label: "Dashboard" },
  { href: "/lider/membros", label: "Membros" },
];

export default async function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checagem server-side: só leader aprovado chega aqui. Feita no layout
  // para cobrir todas as rotas de /lider de uma vez só — mas cada Server
  // Action deste módulo repete a checagem, pois uma Server Action não
  // passa pela árvore de layouts ao ser invocada.
  const profile = await requireLeader();

  return (
    <div className="min-h-screen bg-gray-50">
      <AreaHeader
        variant="leader"
        eyebrow="Área do líder"
        navItems={NAV_ITEMS}
        userName={profile.full_name}
      />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
