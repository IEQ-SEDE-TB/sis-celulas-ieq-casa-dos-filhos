import Link from "next/link";
import { requireAdminOrSenior } from "@/lib/auth/require-role";

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
      <header className="border-b border-secondary-800 bg-secondary-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-300">
              Painel administrativo
            </p>
            <h1 className="text-lg font-semibold text-white">
              SIS Células IEQ Casa dos Filhos
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-secondary-200 underline hover:text-white"
          >
            Voltar
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-4 px-6 pb-4 text-sm">
          <Link href="/admin/temas" className="text-secondary-200 hover:text-white">
            Temas
          </Link>
          <Link href="/admin/celulas" className="text-secondary-200 hover:text-white">
            Células
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
