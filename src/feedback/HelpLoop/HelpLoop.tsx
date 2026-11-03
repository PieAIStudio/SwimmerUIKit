import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';

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
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      update();
    });
    observer.observe(ref.current!);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={['swimmer-help-loop', visible && !reduced && 'is-playing', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      inert
    >
      <div className="swimmer-help-loop-motion">{children}</div>
      {poster != null && <div className="swimmer-help-loop-poster">{poster}</div>}
    </div>
  );
}
