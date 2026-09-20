/**
 * Rotas acessíveis sem estar autenticado/aprovado.
 * Usado pelo middleware para decidir quando aplicar a proteção de rotas.
 */
export const PUBLIC_PATHS = ["/", "/aguardando-aprovacao"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");
}
