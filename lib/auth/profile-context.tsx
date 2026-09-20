"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/types/database";

export interface CurrentProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  churchId: string | null;
}

const ProfileContext = createContext<CurrentProfile | null>(null);

export function ProfileProvider({
  profile,
  children,
}: {
  profile: CurrentProfile;
  children: React.ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Perfil (com role) do usuário logado e aprovado.
 * Só funciona dentro de uma árvore envolvida por <ProfileProvider>
 * (ver app/(protected)/layout.tsx).
 */
export function useProfile(): CurrentProfile {
  const profile = useContext(ProfileContext);

  if (!profile) {
    throw new Error(
      "useProfile() usado fora de um <ProfileProvider>. Certifique-se de que a página está dentro do grupo de rotas protegidas."
    );
  }

  return profile;
}
