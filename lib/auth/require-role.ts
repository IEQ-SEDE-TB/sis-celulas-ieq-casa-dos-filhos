import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { Profile, UserRole } from "@/types/database";

const ADMIN_ROLES: UserRole[] = ["admin", "senior"];

/**
 * Garante que o usuário logado está aprovado e tem role "admin" ou
 * "senior"; caso contrário redireciona para a página inicial.
 *
 * Precisa ser chamado tanto nas páginas (Server Components) quanto no
 * início de cada Server Action do módulo administrativo: o layout só
 * protege a navegação normal, uma Server Action pode ser invocada
 * diretamente sem passar pela árvore de layouts.
 */
export async function requireAdminOrSenior(): Promise<Profile> {
  const current = await getCurrentProfile();

  if (!current || !current.profile || current.profile.status !== "approved") {
    redirect("/");
  }

  if (!ADMIN_ROLES.includes(current.profile.role)) {
    redirect("/");
  }

  return current.profile;
}
