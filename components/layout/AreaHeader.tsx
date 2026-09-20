import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type Variant = "admin" | "leader";

const VARIANT_CLASSES: Record<
  Variant,
  { border: string; bg: string; eyebrow: string; link: string }
> = {
  admin: {
    border: "border-secondary-800",
    bg: "bg-secondary-900",
    eyebrow: "text-secondary-300",
    link: "text-secondary-200 hover:text-white",
  },
  leader: {
    border: "border-primary-800",
    bg: "bg-primary-900",
    eyebrow: "text-primary-300",
    link: "text-primary-200 hover:text-white",
  },
};

/**
 * Cabeçalho compartilhado das áreas /admin (roxo) e /lider (azul) —
 * mesmo layout, só muda a cor (`variant`), o texto de destaque
 * (`eyebrow`) e os links de navegação.
 */
export function AreaHeader({
  variant,
  eyebrow,
  navItems,
}: {
  variant: Variant;
  eyebrow: string;
  navItems: { href: string; label: string }[];
}) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <header className={`border-b ${classes.border} ${classes.bg}`}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Logo size={40} className="shrink-0 rounded-md bg-white/10 p-1" />
          <div>
            <p
              className={`text-xs font-medium uppercase tracking-wide ${classes.eyebrow}`}
            >
              {eyebrow}
            </p>
            <h1 className="text-lg font-semibold text-white">
              SIS Células IEQ Casa dos Filhos
            </h1>
          </div>
        </div>
        <Link href="/" className={`text-sm underline ${classes.link}`}>
          Voltar
        </Link>
      </div>
      <nav className="mx-auto flex max-w-5xl flex-wrap gap-4 px-6 pb-4 text-sm">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={classes.link}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
