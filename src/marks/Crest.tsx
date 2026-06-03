/**
 * Crest.tsx — placeholder crest mark wrapper.
 * Production artwork lands in P1b. Geometry is intentionally simple and
 * monochrome so the 3-part contract holds.
 */
import { forwardRef, type SVGProps } from "react";

export interface CrestProps extends SVGProps<SVGSVGElement> {
  title?: string;
  decorative?: boolean;
}

export const Crest = forwardRef<SVGSVGElement, CrestProps>(function Crest(
  { title, decorative = false, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      {...(decorative ? { role: "presentation", "aria-hidden": true } : {})}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <rect
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        x={16}
        y={16}
        width={224}
        height={224}
        rx={24}
      />
      <path
        fill="currentColor"
        d="M128 56l52 32v40c0 36-26 64-52 80-26-16-52-44-52-80V88l52-32z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        d="M104 144l16 16 32-40"
      />
    </svg>
  );
});
