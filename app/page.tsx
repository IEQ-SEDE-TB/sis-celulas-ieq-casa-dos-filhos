import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function HomePage() {
  const current = await getCurrentProfile();

  if (current?.profile?.status === "pending" || current?.profile?.status === "blocked") {
    redirect("/aguardando-aprovacao");
  }

  const isApproved = current?.profile?.status === "approved";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          SIS Células IEQ Casa dos Filhos
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Igreja Quadrangular Sede &ldquo;Casa dos Filhos&rdquo; &mdash; Tubarão/SC
        </p>

        {isApproved && current?.profile ? (
          <div className="mt-8">
            <p className="text-sm text-gray-600">
              Login realizado com sucesso, {current.profile.full_name}.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Perfil: {current.profile.role} &middot; {current.user.email}
            </p>
            <p className="mt-4 text-xs text-gray-400">
              O painel ainda está em construção.
            </p>
            <form action="/auth/signout" method="post" className="mt-6">
              <button
                type="submit"
                className="text-sm font-medium text-gray-500 underline hover:text-gray-700"
              >
                Sair
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-8 flex justify-center">
            <GoogleSignInButton />
          </div>
        )}

        <p className="mt-8 text-xs text-gray-400">
          Sistema em desenvolvimento.
        </p>
      </div>
    </main>
  );
}
