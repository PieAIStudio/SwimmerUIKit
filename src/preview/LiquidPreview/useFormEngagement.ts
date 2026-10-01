import { useEffect, useRef, useState } from 'react';

import { type LiquidForm } from '../../liquid/forms';
import { PULSE_MS } from './constants';

export function useFormEngagement(): [
  engaged: ReadonlySet<LiquidForm>,
  toggle: (form: LiquidForm) => void,
] {
  const [engaged, setEngaged] = useState<ReadonlySet<LiquidForm>>(new Set());
  const timers = useRef(new Map<LiquidForm, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const toggle = (form: LiquidForm): void => {
    const pulses = form === 'ripple';
    setEngaged((current) => {
      const next = new Set(current);
      if (next.has(form)) next.delete(form);
      else next.add(form);
      return next;
    });
    if (!pulses) return;
    clearTimeout(timers.current.get(form));
    timers.current.set(
      form,
      setTimeout(() => {
        setEngaged((current) => {
          const next = new Set(current);
          next.delete(form);
          return next;
        });
      }, PULSE_MS),
    );
  };

  return [engaged, toggle];
}
