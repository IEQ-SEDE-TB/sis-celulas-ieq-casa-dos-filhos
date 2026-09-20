type Variant = "success" | "neutral" | "danger" | "warning";

const VARIANT_CLASSES: Record<Variant, string> = {
  success: "bg-green-100 text-green-700",
  neutral: "bg-gray-100 text-gray-600",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
