import { useEffect, useRef, useState, type ReactNode } from 'react';

import { GameButton } from '../../controls/GameButton/GameButton';
import { GameProgress } from '../../feedback/GameProgress/GameProgress';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';

/**
 * One selling line on the splash. `highlight` is a word or phrase inside
 * `text` that lights up as the line appears; the product supplies both in the
 * learner's language, the kit supplies none.
 */
export interface GameSplashLine {
  readonly text: string;
  readonly highlight?: string;
}

export interface GameSplashProps {
  /** The product's name, shown large. */
  readonly title: string;
  /** Two or three lines a visit; they take turns while the product loads. */
  readonly lines: readonly GameSplashLine[];
  /** Real readiness, 0 to 1. Never a timer: a bar stuck at 99% is worse than none. */
  readonly progress: number;
  /** What the bar says, including the number if the product wants it shown. */
  readonly progressLabel: string;
  /** Everything the first screen needs has arrived and drawn once. */
  readonly ready: boolean;
  /**
   * `opening`: the first screen, with a tap to enter once ready (the tap is
   * also what lets a web page start sound). `transition`: the same look over a
   * scene change, one line and the bar, no button.
   */
  readonly mode?: 'opening' | 'transition';
  /** The enter button's text, opening mode only. */
  readonly startLabel?: string;
  readonly onStart?: () => void;
  /** Enter by itself when ready, for app shells that need no gesture for sound. */
  readonly autoStart?: boolean;
  /** Seconds each line stays before the next. */
  readonly lineSeconds?: number;
  readonly className?: string;
}

function lineWithHighlight(line: GameSplashLine): ReactNode {
  const at = line.highlight ? line.text.indexOf(line.highlight) : -1;
  if (!line.highlight || at < 0) return line.text;
  return (
    <>
      {line.text.slice(0, at)}
      <mark className="game-ui-splash-mark">{line.highlight}</mark>
      {line.text.slice(at + line.highlight.length)}
    </>
  );
}

/**
 * The opening screen and the scene-change screen, one look for both.
 *
 * Its whole job is to make the wait worth watching and honest: the lines say
 * what the product is for, the bar tracks what is really loading, and entering
 * is offered only when the thing behind it is complete — nobody is held back
 * for effect, and nobody walks into a half-drawn scene.
 */
export function GameSplash({
  title,
  lines,
  progress,
  progressLabel,
  ready,
  mode = 'opening',
  startLabel,
  onStart,
  autoStart = false,
  lineSeconds = 2.6,
  className,
}: GameSplashProps): ReactNode {
  const shown = mode === 'transition' ? lines.slice(0, 1) : lines;
  const reducedMotion = useSystemReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    // Under reduced motion the first line simply stays.
    if (shown.length < 2 || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % shown.length),
      Math.max(1, lineSeconds) * 1000,
    );
    return () => window.clearInterval(timer);
  }, [shown.length, lineSeconds, reducedMotion]);

  const started = useRef(false);
  const start = onStart;
  useEffect(() => {
    if (!ready || !autoStart || started.current || !start) return;
    started.current = true;
    start();
  }, [ready, autoStart, start]);

  const line = shown[index % Math.max(1, shown.length)];
  const percent = Math.round(
    Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * 100,
  );
  const classes = ['game-ui-splash', `game-ui-splash--${mode}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={classes} aria-busy={!ready} aria-label={title} data-splash-ready={ready}>
      <div className="game-ui-splash-body">
        {mode === 'opening' ? <h1 className="game-ui-splash-title">{title}</h1> : null}
        {line ? (
          <p className="game-ui-splash-line" key={index} aria-live="polite">
            {lineWithHighlight(line)}
          </p>
        ) : null}
        <GameProgress
          className="game-ui-splash-progress"
          label={progressLabel}
          value={percent}
          valueLabel={progressLabel}
        />
        {mode === 'opening' && ready && !autoStart && onStart ? (
          <div className="game-ui-splash-start">
            <GameButton variant="primary" autoFocus onClick={() => onStart()}>
              {startLabel}
            </GameButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Whether a waiting screen should appear yet: only once `waiting` has stayed
 * true for `delayMs` without a break. A scene change that finishes inside the
 * delay never shows the screen at all.
 */
export function useGameSplashDelay(waiting: boolean, delayMs = 2000): boolean {
  const [late, setLate] = useState(false);
  useEffect(() => {
    if (!waiting) {
      setLate(false);
      return;
    }
    const timer = window.setTimeout(() => setLate(true), Math.max(0, delayMs));
    return () => window.clearTimeout(timer);
  }, [waiting, delayMs]);
  return waiting && late;
}
