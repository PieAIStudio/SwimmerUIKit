import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';
import { joinClasses } from '../../containers/shared/classes';

export interface HelpLoopProps {
  children: ReactNode;
  /** Meaningful still key frame. CSS selects it even before hydration. */
  poster?: ReactNode;
  className?: string;
}

/** Decorative CSS animation frame; the surrounding help owns its caption. */
export function HelpLoop({ children, poster, className }: HelpLoopProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useSystemReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry!.isIntersecting));
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={joinClasses(
        'swimmer-help-loop',
        visible && !reduced ? 'is-playing' : undefined,
        className,
      )}
      aria-hidden="true"
      inert
    >
      <div className="swimmer-help-loop-motion">{children}</div>
      {poster != null && <div className="swimmer-help-loop-poster">{poster}</div>}
    </div>
  );
}
