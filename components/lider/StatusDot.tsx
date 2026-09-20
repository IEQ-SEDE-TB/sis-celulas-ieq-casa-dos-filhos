export type MeetingDotStatus = "done" | "pending" | "late";

const CONFIG: Record<MeetingDotStatus, { color: string; label: string }> = {
  done: { color: "bg-green-500", label: "Realizada" },
  pending: { color: "bg-amber-400", label: "Pendente" },
  late: { color: "bg-red-500", label: "Atrasada" },
};

export function StatusDot({ status }: { status: MeetingDotStatus }) {
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
