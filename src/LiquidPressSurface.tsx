import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LiquidSurface, type LiquidSurfaceProps } from './LiquidSurface';

/** Internal assembly: native controls own all semantics; only the silhouette presses. */
export function LiquidPressSurface({
  children,
  static: isStatic = false,
  ...surface
}: Omit<LiquidSurfaceProps, 'active' | 'form'> & { static?: boolean }): ReactNode {
  const [pressed, setPressed] = useState(false);
  const pointerHeld = useRef(false);
  const release = (): void => {
    pointerHeld.current = false;
    setPressed(false);
  };
  useEffect(() => {
    // A true window deactivation cancels the gesture even if no pointerup is
    // delivered. Native button focus changes alone are not window deactivation.
    const cancel = (): void => {
      pointerHeld.current = false;
      setPressed(false);
    };
    window.addEventListener('blur', cancel);
    return () => window.removeEventListener('blur', cancel);
  }, []);
  return (
    <LiquidSurface {...surface} active={pressed && !isStatic} form="press">
      <span
        onBlur={(event) => {
          // WebKit on macOS blurs a keyboard-focused button immediately after
          // pointerdown, while the finger/mouse is still holding it. Do not
          // mistake that native focus policy for releasing the pointer.
          if (
            !pointerHeld.current ||
            (event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget))
          )
            release();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') release();
          if (
            !event.defaultPrevented &&
            !event.repeat &&
            (event.key === ' ' || event.key === 'Enter')
          )
            setPressed(true);
        }}
        onKeyUp={release}
        onLostPointerCapture={release}
        onPointerCancel={release}
        onPointerDown={(event) => {
          const control =
            event.target instanceof Element ? event.target.closest('button,select,input') : null;
          if (event.button === 0 && !event.defaultPrevented && !control?.matches(':disabled')) {
            pointerHeld.current = true;
            setPressed(true);
          }
        }}
        onPointerLeave={release}
        onPointerUp={release}
      >
        {children}
      </span>
    </LiquidSurface>
  );
}
