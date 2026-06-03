/**
 * Iconmark.tsx — placeholder iconmark (simplified shield, 64×64).
 */
import { forwardRef, type SVGProps } from "react";

export interface IconmarkProps extends SVGProps<SVGSVGElement> {
  title?: string;
  decorative?: boolean;
}

export const Iconmark = forwardRef<SVGSVGElement, IconmarkProps>(
  function Iconmark({ title, decorative = false, ...rest }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="currentColor"
        {...(decorative ? { role: "presentation", "aria-hidden": true } : {})}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M32 8l20 12v18c0 14-10 22-20 28-10-6-20-14-20-28V20L32 8z"
        />
      </svg>
    );
  },
);
