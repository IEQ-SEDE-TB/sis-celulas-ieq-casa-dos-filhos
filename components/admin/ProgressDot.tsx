import type { CellProgressStatus } from "@/lib/data/cell-progress";

const CONFIG: Record<CellProgressStatus, { color: string; label: string }> = {
  on_track: { color: "bg-green-500", label: "Em dia" },
  behind: { color: "bg-amber-400", label: "Atrasada" },
  overdue: { color: "bg-red-500", label: "Vencida" },
  none: { color: "bg-gray-300", label: "—" },
};

export function ProgressDot({ status }: { status: CellProgressStatus }) {
  const { color, label } = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </span>
  );
}
