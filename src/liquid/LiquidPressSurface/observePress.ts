/** A press stays visibly pressed at least this long, so a fast tap still shows its squash. */
export const MIN_PRESS_HOLD_MS = 140;

/** Native events remain native. This observer never clicks, captures pointers,
 * prevents default, changes focus or owns a control's selected/value state.
 *
 * A normal release (pointerup, or the key that began the press) keeps the body
 * pressed until MIN_PRESS_HOLD_MS after the press began, then lets it go into
 * the spring. Cancellation, Escape, blur, disabling, a hidden page and teardown
 * release at once: nothing that went wrong waits for the hold. */
export function observePress(target: HTMLElement, notify: (pressed: boolean) => void): () => void {
  let pressed = false,
    pointer: number | null = null,
    key: string | null = null;
  let disposed = false,
    generation = 0;
  // Running from the start of a press; `ended` means the user let go inside it.
  let hold: ReturnType<typeof setTimeout> | undefined;
  let ended = false;
  let detachActive = () => {};
  const disabled = () =>
    target.matches(':disabled,[aria-disabled="true"]') ||
    Boolean(target.querySelector(':scope > input:disabled'));
  const release = () => {
    generation++;
    pointer = null;
    key = null;
    ended = false;
    clearTimeout(hold);
    hold = undefined;
    detachActive();
    detachActive = () => {};
    if (pressed) {
      pressed = false;
      notify(false);
    }
  };
  // The user let go. Inside the minimum hold the body stays down; the timer
  // lets it go. Anything that is not a plain release ends the press at once.
  const finish = (event: Event) => {
    if (ended) return;
    pointer = null;
    key = null;
    detachActive();
    detachActive = () => {};
    if (event.defaultPrevented || hold === undefined) release();
    else ended = true;
  };
  const begin = () => {
    if (pressed) {
      // A new press lands inside the hold of the previous one: stay down for it.
      ended = false;
      attach();
      return;
    }
    pressed = true;
    notify(true);
    hold = setTimeout(() => {
      hold = undefined;
      if (ended) release();
    }, MIN_PRESS_HOLD_MS);
    attach();
  };
  const attach = () => {
    detachActive();
    const up = (event: PointerEvent) => {
      if (pointer === null || event.pointerId === pointer) finish(event);
    };
    const cancel = (event: PointerEvent) => {
      if (pointer === null || event.pointerId === pointer) release();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.key === key) finish(event);
      else if (event.key === 'Escape') release();
    };
    const visibility = () => {
      if (document.hidden) release();
    };
    const observer = new MutationObserver(() => {
      if (disabled()) release();
    });
    for (let node: HTMLElement | null = target; node; node = node.parentElement)
      if (node === target || node.tagName === 'FIELDSET')
        observer.observe(node, {
          attributes: true,
          attributeFilter: ['disabled', 'aria-disabled'],
        });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);
    detachActive = () => {
      observer.disconnect();
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
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
    if (pointer === null || event.pointerId === pointer) finish(event);
  };
  const localCancel = (event: PointerEvent) => {
    if (pointer === null || event.pointerId === pointer) release();
  };
  // Touch pointers also leave right after they lift. That is the release we are
  // already holding, not a second cancellation, so it is ignored inside the hold.
  const leave = () => {
    if (!ended) release();
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
  const keyUpOnTarget = (event: KeyboardEvent) => {
    if (event.key === key) finish(event);
    else release();
  };
  const blur = (event: FocusEvent) => {
    // Focus moving on from a click is normal; it must not cut the hold short.
    if (ended) return;
    if (
      pointer === null ||
      (event.relatedTarget instanceof Node && !target.contains(event.relatedTarget))
    )
      release();
  };
  target.addEventListener('pointerdown', down);
  target.addEventListener('pointerup', localUp);
  target.addEventListener('pointercancel', localCancel);
  target.addEventListener('pointerleave', leave);
  target.addEventListener('lostpointercapture', leave);
  target.addEventListener('keydown', keyDown);
  target.addEventListener('keyup', keyUpOnTarget);
  target.addEventListener('blur', blur, true);
  return () => {
    disposed = true;
    release();
    target.removeEventListener('pointerdown', down);
    target.removeEventListener('pointerleave', leave);
    target.removeEventListener('pointerup', localUp);
    target.removeEventListener('pointercancel', localCancel);
    target.removeEventListener('lostpointercapture', leave);
    target.removeEventListener('keydown', keyDown);
    target.removeEventListener('keyup', keyUpOnTarget);
    target.removeEventListener('blur', blur, true);
  };
}
