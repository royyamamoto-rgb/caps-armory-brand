/**
 * Wordmark.tsx — placeholder wordmark (text-only, Inter 800).
 */
import { forwardRef, type SVGProps } from "react";

export interface WordmarkProps extends SVGProps<SVGSVGElement> {
  title?: string;
  decorative?: boolean;
}

export const Wordmark = forwardRef<SVGSVGElement, WordmarkProps>(
  function Wordmark({ title, decorative = false, ...rest }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 256"
        fill="currentColor"
        {...(decorative ? { role: "presentation", "aria-hidden": true } : {})}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        <text
          fill="currentColor"
          x={32}
          y={172}
          fontFamily="Inter Variable, system-ui, sans-serif"
          fontSize={160}
          fontWeight={800}
          letterSpacing={6}
        >
          CAPS ARMORY
        </text>
      </svg>
    );
  },
);
