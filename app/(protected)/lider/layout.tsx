import Link from "next/link";
import { requireLeader } from "@/lib/auth/require-role";

export default async function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checagem server-side: só leader aprovado chega aqui. Feita no layout
  // para cobrir todas as rotas de /lider de uma vez só — mas cada Server
  // Action deste módulo repete a checagem, pois uma Server Action não
  // passa pela árvore de layouts ao ser invocada.
  await requireLeader();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-primary-800 bg-primary-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-300">
              Área do líder
            </p>
            <h1 className="text-lg font-semibold text-white">
              SIS Células IEQ Casa dos Filhos
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-primary-200 underline hover:text-white"
          >
            Voltar
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-4 px-6 pb-4 text-sm">
          <Link
            href="/lider/dashboard"
            className="text-primary-200 hover:text-white"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
