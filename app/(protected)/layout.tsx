import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { ProfileProvider } from "@/lib/auth/profile-context";

/**
 * Layout para as futuras páginas internas (dashboard admin/senior/leader).
 * O middleware já bloqueia o acesso a quem não está autenticado/aprovado,
 * mas repetimos a checagem aqui como segunda camada de defesa e para
 * disponibilizar o perfil (com role) via useProfile() nas páginas filhas.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/");
  }

  if (!current.profile || current.profile.status !== "approved") {
    redirect("/aguardando-aprovacao");
  }

  const { profile } = current;

  return (
    <ProfileProvider
      profile={{
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        role: profile.role,
        churchId: profile.church_id,
      }}
    >
      {children}
    </ProfileProvider>
  );
}
