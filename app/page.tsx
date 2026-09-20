import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Logo } from "@/components/ui/Logo";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getLeaderCell } from "@/lib/data/leader-cell";

export default async function HomePage() {
  const current = await getCurrentProfile();

  if (current?.profile?.status === "pending" || current?.profile?.status === "blocked") {
    redirect("/aguardando-aprovacao");
  }

  if (current?.profile?.status === "approved") {
    const { role, id } = current.profile;

    if (role === "admin" || role === "senior") {
      redirect("/admin/dashboard");
    }

    // role === "leader": vai para o dashboard se já tiver célula, ou
    // para o cadastro de célula (autoatendimento) se ainda não tiver.
    const cell = await getLeaderCell(id);
    redirect(cell ? "/lider/dashboard" : "/lider/celula/nova");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-lg sm:p-12">
        <div className="flex justify-center">
          <Logo size={96} priority />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
          SIS Células IEQ Casa dos Filhos
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Igreja Quadrangular Sede &ldquo;Casa dos Filhos&rdquo; &mdash; Tubarão/SC
        </p>

        <div className="mt-10 flex justify-center">
          <GoogleSignInButton />
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Sistema em desenvolvimento.
        </p>
      </div>
    </main>
  );
}
