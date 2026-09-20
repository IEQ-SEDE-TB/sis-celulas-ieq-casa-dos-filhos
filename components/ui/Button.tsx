import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "bg-secondary-600 text-white hover:bg-secondary-700",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-500 hover:text-gray-700 underline",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  children: React.ReactNode;
};

function classes(variant: Variant, size: Size, className?: string) {
  return [BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className]
    .filter(Boolean)
    .join(" ");
}

/**
 * Botão padrão do sistema. Passe `href` para renderizar como link
 * estilizado como botão (ex: "Novo Tema" navegando para /admin/temas/novo).
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className } = props;

  if ("href" in props && props.href) {
    const { href, children } = props;
    return (
      <Link href={href} className={classes(variant, size, className)}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, href: _h, ...buttonProps } =
    props as ButtonAsButton;

  return (
    <button
      {...buttonProps}
      className={classes(variant, size, className)}
    />
  );
}
