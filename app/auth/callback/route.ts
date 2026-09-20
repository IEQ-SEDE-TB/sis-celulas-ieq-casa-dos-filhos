import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o "code" retornado pelo Google/Supabase por uma sessão e, no
 * primeiro login, cria o registro em `profiles` com status "pending" e
 * role "leader" (sem nenhum acesso liberado até um admin/senior aprovar).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  const authUser = data.user;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("status")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  let status = existingProfile?.status;

  if (!existingProfile) {
    const fullName =
      (authUser.user_metadata?.full_name as string | undefined) ??
      (authUser.user_metadata?.name as string | undefined) ??
      authUser.email ??
      "Sem nome";

    const { data: insertedProfile } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: authUser.id,
        full_name: fullName,
        email: authUser.email ?? "",
      })
      .select("status")
      .single();

    status = insertedProfile?.status ?? "pending";
  }

  if (status === "pending" || status === "blocked") {
    return NextResponse.redirect(
      new URL("/aguardando-aprovacao", requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
