/**
 * Formata uma data "YYYY-MM-DD" (coluna `date` do Postgres) para
 * "DD/MM/AAAA". Evita usar `new Date(str)` puro, que interpreta a data
 * como UTC e pode exibir o dia errado dependendo do fuso do navegador.
 */
export function formatDateBR(dateStr: string | null): string {
  if (!dateStr) return "—";

  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;

  return `${day}/${month}/${year}`;
}

/**
 * Formata um timestamp ISO (coluna timestamptz, ex: `created_at`) para
 * "DD/MM/AAAA".
 */
export function formatTimestampBR(isoStr: string | null): string {
  if (!isoStr) return "—";

  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}
