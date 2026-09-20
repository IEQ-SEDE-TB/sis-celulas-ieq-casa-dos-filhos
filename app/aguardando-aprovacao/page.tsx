import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Logo } from "@/components/ui/Logo";

export default async function AguardandoAprovacaoPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/");
  }

  if (current.profile?.status === "approved") {
    redirect("/");
  }

  const isBlocked = current.profile?.status === "blocked";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex justify-center">
          <Logo size={72} />
        </div>
        <h1 className="mt-6 text-xl font-semibold text-gray-900">
          {isBlocked ? "Acesso bloqueado" : "Aguardando aprovação"}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {isBlocked
            ? "Seu acesso foi bloqueado por um administrador. Entre em contato com a liderança da igreja para mais informações."
            : "Seu acesso está aguardando aprovação de um administrador. Assim que for aprovado, você poderá acessar o sistema normalmente."}
        </p>
        <p className="mt-1 text-sm text-gray-400">{current.user.email}</p>

        <form action="/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="text-sm font-medium text-gray-500 underline hover:text-gray-700"
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
