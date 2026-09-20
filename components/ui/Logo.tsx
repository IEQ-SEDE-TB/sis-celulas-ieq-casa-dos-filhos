import Image from "next/image";

/**
 * Logo oficial da IEQ (cruz, pomba, cálice e coroa). Arquivo em
 * public/logo-ieq.png, com fundo transparente — funciona tanto sobre
 * fundo branco quanto sobre os cabeçalhos coloridos (roxo/azul).
 */
export function Logo({
  size = 48,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-ieq.png"
      alt="Logo Igreja do Evangelho Quadrangular"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
