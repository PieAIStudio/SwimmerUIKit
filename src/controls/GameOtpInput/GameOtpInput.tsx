import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export interface GameOtpInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput' | 'children'
> {
  /** Number of numeric slots; defaults to six. */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Only user input completes a code; mounting or changing props never submits. */
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Zero-based slot index, followed by the configured length. */
  getSlotLabel?: (index: number, length: number) => string;
  getSlotDescription?: (index: number, length: number) => string;
}

function digits(value: string): string {
  return value.normalize('NFKC').replace(/[^0-9]/g, '');
}

/** Numeric entry only. Sending, expiry, validation and retries belong to the host. */
export function GameOtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid = false,
  disabled = false,
  readOnly = false,
  getSlotLabel = (index, count) => `${index + 1} / ${count}`,
  getSlotDescription,
  className,
  'aria-describedby': describedBy,
  ...props
}: GameOtpInputProps): ReactNode {
  if (!Number.isSafeInteger(length) || length < 1 || length > 32) {
    throw new RangeError('GameOtpInput length must be an integer from 1 to 32.');
  }
  const id = useId();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const composing = useRef(false);
  const [draft, setDraft] = useState<{ index: number; text: string } | null>(null);
  const code = digits(value).slice(0, length);
  const focus = (index: number) => {
    const input = inputs.current[Math.max(0, Math.min(index, length - 1))];
    input?.focus();
    input?.select();
  };
  const emit = (next: string) => {
    if (next === code) return;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };
  const insert = (index: number, raw: string) => {
    if (disabled || readOnly) return;
    const text = digits(raw);
    if (!text) {
      // Do not let rejected native input remain visible in a controlled slot.
      const input = inputs.current[index];
      if (input) input.value = code[index] ?? '';
      return;
    }
    const start = text.length >= length ? 0 : Math.min(index, code.length);
    const next = (code.slice(0, start) + text + code.slice(start + text.length)).slice(0, length);
    emit(next);
    focus(Math.min(start + text.length, length - 1));
  };
  const erase = (index: number, backward: boolean) => {
    if (disabled || readOnly) return;
    const target = backward && !code[index] ? index - 1 : index;
    if (target >= 0) emit(code.slice(0, target) + code.slice(target + 1));
    focus(backward ? Math.max(0, index - 1) : Math.min(index, code.length));
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    if (disabled || readOnly) return;
    const targets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: Math.min(index + 1, code.length),
      Home: 0,
      End: Math.min(code.length, length - 1),
    };
    const target = targets[event.key];
    if (target !== undefined) {
      event.preventDefault();
      focus(target);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      erase(index, event.key === 'Backspace');
    }
  };

  return (
    <div
      {...props}
      role="group"
      aria-describedby={describedBy}
      className={['game-ui-otp', className].filter(Boolean).join(' ')}
      data-invalid={invalid || undefined}
      dir="ltr"
    >
      {Array.from({ length }, (_, index) => {
        const description = getSlotDescription?.(index, length);
        const descriptionId = description ? `${id}-${index}-description` : undefined;
        return (
          <span className="game-ui-otp-slot" key={index}>
            <input
              ref={(element) => {
                inputs.current[index] = element;
              }}
              id={`${id}-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              spellCheck={false}
              autoCapitalize="off"
              aria-label={getSlotLabel(index, length)}
              aria-describedby={[describedBy, descriptionId].filter(Boolean).join(' ') || undefined}
              aria-invalid={invalid || undefined}
              className="game-ui-otp-input"
              disabled={disabled}
              readOnly={readOnly}
              value={draft?.index === index ? draft.text : (code[index] ?? '')}
              // Focus can advance before the parent's controlled value commits.
              // Do not send it backwards using the preceding render's length.
              onFocus={(event) => event.currentTarget.select()}
              onKeyDown={(event) => keyDown(event, index)}
              onChange={(event) => {
                if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
                  setDraft({ index, text: event.currentTarget.value });
                } else if (event.currentTarget.value === '') {
                  erase(
                    index,
                    (event.nativeEvent as InputEvent).inputType === 'deleteContentBackward',
                  );
                } else {
                  insert(index, event.currentTarget.value);
                }
              }}
              onPaste={(event) => {
                if (composing.current) return;
                event.preventDefault();
                insert(index, event.clipboardData.getData('text/plain'));
              }}
              onCompositionStart={(event) => {
                composing.current = true;
                setDraft({ index, text: event.currentTarget.value });
              }}
              onCompositionEnd={(event) => {
                const text = event.currentTarget.value;
                composing.current = false;
                setDraft(null);
                insert(index, text);
              }}
              data-game-ui-paint=""
            />
            {description ? (
              <span id={descriptionId} className="game-ui-sr-only">
                {description}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
