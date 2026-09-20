import { createClient } from "@/lib/supabase/server";

const DEFAULT_CHURCH_NAME = "Casa dos Filhos";
const DEFAULT_CHURCH_CITY = "Tubarão";
const DEFAULT_CHURCH_STATE = "SC";

/**
 * Por enquanto o sistema atende uma única igreja. Retorna o id da
 * primeira linha em `churches`, criando-a (Casa dos Filhos - Tubarão/SC)
 * se ainda não existir.
 */
export async function getDefaultChurchId(): Promise<string> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("churches")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("churches")
    .insert({
      name: DEFAULT_CHURCH_NAME,
      city: DEFAULT_CHURCH_CITY,
      state: DEFAULT_CHURCH_STATE,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Não foi possível preparar a igreja padrão.");
  }

  return created.id;
}
