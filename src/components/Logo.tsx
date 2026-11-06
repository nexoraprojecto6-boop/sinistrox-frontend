import { useId } from "react";
import "./Logo.css";

type MarkProps = { size?: number; className?: string };

/** Só o X: duas lâminas vermelhas, a de trás cortada onde a da frente passa. */
export function LogoMark({ size = 32, className }: MarkProps) {
  const id = "sx-cut-" + useId().replace(/:/g, "");
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="X"
    >
      <defs>
        <mask id={id}>
          <rect width="100" height="100" fill="white" />
          <polygon
            points="92,8 66,8 8,92 34,92"
            fill="black"
            stroke="black"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <polygon points="8,8 34,8 92,92 66,92" fill="#B80000" mask={`url(#${id})`} />
      <polygon points="92,8 66,8 8,92 34,92" fill="#FF1F1F" />
    </svg>
  );
}

type LogoProps = {
  /** Tamanho da letra em px (o X acompanha). */
  size?: number;
  className?: string;
};

/** Logo completa: SINISTRO + X vermelho. O texto usa a cor do contexto (currentColor). */
export default function Logo({ size = 28, className }: LogoProps) {
  return (
    <span
      className={"sx-logo" + (className ? " " + className : "")}
      style={{ fontSize: size }}
      aria-label="Sinistro X"
    >
      <span className="sx-logo__word" aria-hidden="true">SINISTRO</span>
      <LogoMark className="sx-logo__x" size={size * 1.15} />
    </span>
  );
}
