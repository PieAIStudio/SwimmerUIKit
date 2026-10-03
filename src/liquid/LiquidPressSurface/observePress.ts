/** Native events remain native. This observer never clicks, captures pointers,
 * prevents default, changes focus or owns a control's selected/value state. */
export function observePress(target: HTMLElement, notify: (pressed: boolean) => void): () => void {
  let pressed = false,
    pointer: number | null = null,
    key: string | null = null;
  let disposed = false,
    generation = 0;
  let detachActive = () => {};
  const disabled = () =>
    target.matches(':disabled,[aria-disabled="true"]') ||
    Boolean(target.querySelector(':scope > input:disabled'));
  const release = () => {
    generation++;
    pointer = null;
    key = null;
    detachActive();
    detachActive = () => {};
    if (pressed) {
      pressed = false;
      notify(false);
    }
  };
  const begin = () => {
    if (pressed) return;
    pressed = true;
    notify(true);
    const up = (event: PointerEvent) => {
      if (pointer === null || event.pointerId === pointer) release();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.key === key || event.key === 'Escape') release();
    };
    const visibility = () => {
      if (document.hidden) release();
    };
    const observer = new MutationObserver(() => {
      if (disabled()) release();
    });
    for (let node: HTMLElement | null = target; node; node = node.parentElement) {
      if (node === target || node.tagName === 'FIELDSET')
        observer.observe(node, {
          attributes: true,
          attributeFilter: ['disabled', 'aria-disabled'],
        });
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);
    detachActive = () => {
      observer.disconnect();
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', visibility);
    };
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || disabled()) return;
    const token = ++generation;
    pointer = event.pointerId;
    // React's delegated handler may prevent this event later in the bubble.
    queueMicrotask(() => {
      if (
        !disposed &&
        token === generation &&
        !event.defaultPrevented &&
        !disabled() &&
        target.isConnected
      )
        begin();
      else if (token === generation) pointer = null;
    });
  };
  const localUp = (event: PointerEvent) => {
    if (pointer === null || event.pointerId === pointer) release();
  };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      release();
      return;
    }
    if (event.repeat || (event.key !== ' ' && event.key !== 'Enter') || disabled()) return;
    if (target.tagName === 'LABEL' && event.key === 'Enter') return;
    // A link activates on Enter; Space keeps native page-scrolling semantics.
    if (target.tagName === 'A' && event.key === ' ') return;
    const token = ++generation;
    queueMicrotask(() => {
      if (
        !disposed &&
        token === generation &&
        !event.defaultPrevented &&
        !disabled() &&
        target.isConnected
      ) {
        key = event.key;
        begin();
      }
    });
  };
  const blur = (event: FocusEvent) => {
    if (
      pointer === null ||
      (event.relatedTarget instanceof Node && !target.contains(event.relatedTarget))
    )
      release();
  };
  target.addEventListener('pointerdown', down);
  target.addEventListener('pointerup', localUp);
  target.addEventListener('pointercancel', localUp);
  target.addEventListener('pointerleave', release);
  target.addEventListener('lostpointercapture', release);
  target.addEventListener('keydown', keyDown);
  target.addEventListener('keyup', release);
  target.addEventListener('blur', blur, true);
  return () => {
    disposed = true;
    release();
    target.removeEventListener('pointerdown', down);
    target.removeEventListener('pointerleave', release);
    target.removeEventListener('pointerup', localUp);
    target.removeEventListener('pointercancel', localUp);
    target.removeEventListener('lostpointercapture', release);
    target.removeEventListener('keydown', keyDown);
    target.removeEventListener('keyup', release);
    target.removeEventListener('blur', blur, true);
  };
}
