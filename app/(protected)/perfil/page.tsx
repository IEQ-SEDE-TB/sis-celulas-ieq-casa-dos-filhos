import { requireApprovedUser } from "@/lib/auth/require-role";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "./ProfileForm";

export default async function PerfilPage() {
  const profile = await requireApprovedUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-xl font-semibold text-gray-900">
          Meu perfil
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          {profile.email}
        </p>

        <div className="mt-6">
          <ProfileForm fullName={profile.full_name} />
        </div>

        <div className="mt-6 text-center">
          <Button href="/" variant="ghost">
            Voltar
          </Button>
        </div>
      </div>
    </main>
  );
}
