export type CellProgressStatus = "on_track" | "behind" | "overdue" | "none";

/**
 * Compara o progresso real de uma célula num tema (quantas reuniões já
 * marcou como realizadas) com o ritmo esperado até hoje, assumindo que
 * as reuniões do tema se distribuem uniformemente entre start_date e
 * end_date:
 * - "overdue" (vermelho): a vigência do tema já encerrou e ainda falta
 *   reunião sem registro.
 * - "behind" (amarelo): ainda dentro do prazo, mas com menos reuniões
 *   realizadas do que o esperado até hoje.
 * - "on_track" (verde): em dia (ou tema sem datas definidas e já
 *   concluído).
 * - "none": não há tema selecionado ou o tema não tem reuniões.
 */
export function computeCellProgressStatus({
  today,
  themeStartDate,
  themeEndDate,
  totalMeetings,
  doneCount,
}: {
  today: string;
  themeStartDate: string | null;
  themeEndDate: string | null;
  totalMeetings: number;
  doneCount: number;
}): CellProgressStatus {
  if (totalMeetings === 0) {
    return "none";
  }

  if (themeEndDate && today > themeEndDate) {
    return doneCount >= totalMeetings ? "on_track" : "overdue";
  }

  if (!themeStartDate || !themeEndDate) {
    return doneCount >= totalMeetings ? "on_track" : "behind";
  }

  const start = new Date(themeStartDate).getTime();
  const end = new Date(themeEndDate).getTime();
  const now = new Date(today).getTime();

  const elapsedFraction =
    end <= start ? 1 : Math.min(1, Math.max(0, (now - start) / (end - start)));

  const expectedDone = Math.floor(totalMeetings * elapsedFraction);

  return doneCount >= expectedDone ? "on_track" : "behind";
}
