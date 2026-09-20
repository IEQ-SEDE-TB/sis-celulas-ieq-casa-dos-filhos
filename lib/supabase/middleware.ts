import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath } from "@/lib/auth/routes";

/**
 * Atualiza a sessao do Supabase a cada request e protege as rotas que nao
 * estao na lista de rotas publicas (ver lib/auth/routes.ts):
 * - sem sessao -> redireciona para a landing page ("/")
 * - sessao mas profile "pending"/"blocked" (ou inexistente) -> "/aguardando-aprovacao"
 * - profile "approved" -> segue normalmente (o role fica disponivel via
 *   useProfile(), fornecido pelo layout de app/(protected))
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Ainda sem as chaves do Supabase configuradas em .env.local: não há
  // sessao para atualizar, apenas segue a requisicao normalmente.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile || profile.status === "pending" || profile.status === "blocked") {
    return NextResponse.redirect(new URL("/aguardando-aprovacao", request.url));
  }

  return response;
}
