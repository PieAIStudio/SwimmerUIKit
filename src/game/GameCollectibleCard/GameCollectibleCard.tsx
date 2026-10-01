import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { playGameCardRevealSound } from '../../feedback/sound/interactionSound';

import { useSystemReducedMotion } from '../../tokens/reducedMotion';

import type { GameCardTilt } from './orientation';

/**
 * How rare the card is, which is how it is framed: `common` a plain silver
 * frame, `rare` a violet frame with a gem set in the top, `legendary` a gold
 * frame with a crown, a foil that shifts as the card tilts and a soft light
 * behind it. The product decides what earns each; the kit only draws them.
 */
export type GameCollectibleCardRarity = 'common' | 'rare' | 'legendary';

export interface GameCollectibleCardProps {
  readonly rarity: GameCollectibleCardRarity;
  /** The card's name, large on the face. */
  readonly title: string;
  /** One line under the name. */
  readonly caption?: string;
  /** The set it belongs to, on the band at the top. */
  readonly setLabel?: string;
  /** The rarity's short word, in the band's chip. */
  readonly rarityLabel?: string;
  /** The illustration; the product supplies it. */
  readonly art?: ReactNode;
  /** A row of pips under the caption, such as progress toward the next rarity. */
  readonly pips?: { readonly filled: number; readonly total: number };
  /** A sticker on the corner, such as "NEW!". */
  readonly sticker?: string;
  /** The back of the card; the kit draws a plain emblem when omitted. */
  readonly back?: ReactNode;
  /** The full accessible name, including what a tap does. */
  readonly label: string;
  /** Controlled: whether the back is showing. */
  readonly faceDown?: boolean;
  /** Uncontrolled start. */
  readonly defaultFaceDown?: boolean;
  readonly onFlip?: (faceDown: boolean) => void;
  /** A soft light turns behind the card: the moment the rarest card is revealed. */
  readonly spotlight?: boolean;
  /** Play a synthesized flip sound; browsers allow it only after the page has been tapped. */
  readonly sound?: boolean;
  /** Optional normalized tilt from one explicitly enabled sensor owner. A
   * pointer on this card takes precedence; reduced motion always wins. */
  readonly tilt?: GameCardTilt | null;
  readonly className?: string;
}

/** Tilt follows the pointer by up to this many degrees; a drag of a few pixels is not a tap. */
const TILT = 10;

const DRAG_SLOP = 6;

function Pips({ filled, total }: { filled: number; total: number }) {
  return (
    <span className="game-ui-collect-card-pips" aria-hidden="true">
      {Array.from({ length: Math.max(0, total) }, (_, index) => (
        <i key={index} data-on={index < filled ? 'true' : undefined} />
      ))}
    </span>
  );
}

function Inlay({ rarity }: { rarity: GameCollectibleCardRarity }) {
  if (rarity === 'legendary')
    return (
      <svg className="game-ui-collect-card-inlay" viewBox="0 0 34 22" aria-hidden="true">
        <path
          className="game-ui-collect-card-crown"
          d="M3 19 L5 5 L12 11 L17 2 L22 11 L29 5 L31 19 Z"
        />
        <circle className="game-ui-collect-card-jewel" cx="17" cy="14" r="2.6" />
      </svg>
    );
  if (rarity === 'rare')
    return (
      <svg className="game-ui-collect-card-inlay" viewBox="0 0 22 22" aria-hidden="true">
        <path className="game-ui-collect-card-gem" d="M11 2 L19 10 L11 20 L3 10 Z" />
        <path className="game-ui-collect-card-gem-light" d="M11 2 L14 10 L11 20" />
      </svg>
    );
  return null;
}

function DefaultBack() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle className="game-ui-collect-card-back-ring" cx="50" cy="50" r="38" />
      <circle className="game-ui-collect-card-back-dash" cx="50" cy="50" r="28" />
      <path
        className="game-ui-collect-card-back-star"
        d="M50 14 L57 43 L86 50 L57 57 L50 86 L43 57 L14 50 L43 43 Z"
      />
      <circle className="game-ui-collect-card-back-core" cx="50" cy="50" r="6" />
    </svg>
  );
}

/**
 * A collectible card: tilts toward the pointer with a glare that follows it,
 * flips on a tap, and is framed by rarity. Built for a card album where
 * collecting and reviewing are the same act, but it holds nothing about
 * learning: every word and picture comes from the product.
 *
 * Under reduced motion the card does not tilt, shine or spin its light, and a
 * flip is instant.
 */
export function GameCollectibleCard({
  rarity,
  title,
  caption,
  setLabel,
  rarityLabel,
  art,
  pips,
  sticker,
  back,
  label,
  faceDown,
  defaultFaceDown = false,
  onFlip,
  spotlight = false,
  sound = false,
  tilt: externalTilt,
  className,
}: GameCollectibleCardProps): ReactNode {
  const reducedMotion = useSystemReducedMotion();
  const [ownFaceDown, setOwnFaceDown] = useState(defaultFaceDown);
  const down = faceDown ?? ownFaceDown;
  const [tilt, setTilt] = useState({ x: 50, y: 50, active: false });
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  useEffect(() => {
    if (reducedMotion) setTilt({ x: 50, y: 50, active: false });
  }, [reducedMotion]);

  const follow = (event: PointerEvent<HTMLButtonElement>) => {
    const start = press.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_SLOP)
      start.moved = true;
    if (reducedMotion) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100));
    setTilt({ x, y, active: true });
  };

  const flip = () => {
    const next = !down;
    if (faceDown === undefined) setOwnFaceDown(next);
    onFlip?.(next);
    if (sound) playGameCardRevealSound(next ? 'common' : rarity);
  };

  const sensor =
    externalTilt && Number.isFinite(externalTilt.x) && Number.isFinite(externalTilt.y)
      ? {
          x: 50 + Math.min(1, Math.max(-1, externalTilt.x)) * 50,
          y: 50 + Math.min(1, Math.max(-1, externalTilt.y)) * 50,
          active: true,
        }
      : null;
  const drawn = reducedMotion
    ? { x: 50, y: 50, active: false }
    : tilt.active
      ? tilt
      : (sensor ?? tilt);
  const style = {
    '--card-mx': `${drawn.x}%`,
    '--card-my': `${drawn.y}%`,
    '--card-rx': `${drawn.active ? ((50 - drawn.y) / 50) * TILT : 0}deg`,
    '--card-ry': `${drawn.active ? ((drawn.x - 50) / 50) * TILT : 0}deg`,
  } as CSSProperties;
  const classes = [
    'game-ui-collect-card',
    `game-ui-collect-card--${rarity}`,
    down ? 'game-ui-collect-card--down' : null,
    spotlight ? 'game-ui-collect-card--spotlight' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={style}
      aria-label={label}
      aria-pressed={down}
      data-rarity={rarity}
      onPointerDown={(event) => {
        press.current = { x: event.clientX, y: event.clientY, moved: false };
      }}
      onPointerMove={follow}
      onPointerCancel={() => {
        press.current = null;
        setTilt((current) => ({ ...current, active: false }));
      }}
      onPointerLeave={() => setTilt((current) => ({ ...current, active: false }))}
      onClick={(event) => {
        // A drag that tilted the card is not a tap on it.
        const moved = event.detail !== 0 && (press.current?.moved ?? false);
        press.current = null;
        if (!moved) flip();
      }}
    >
      <span className="game-ui-collect-card-face" aria-hidden="true">
        {sticker ? <span className="game-ui-collect-card-sticker">{sticker}</span> : null}
        <Inlay rarity={rarity} />
        {/* The foil shimmers on the frame and the art, never over the words. */}
        {rarity === 'legendary' ? <span className="game-ui-collect-card-foil" /> : null}
        <span className="game-ui-collect-card-inner">
          {setLabel || rarityLabel ? (
            <span className="game-ui-collect-card-band">
              {rarityLabel ? (
                <span className="game-ui-collect-card-chip">{rarityLabel}</span>
              ) : null}
              {setLabel ? <span>{setLabel}</span> : null}
            </span>
          ) : null}
          <span className="game-ui-collect-card-art">
            {art}
            {rarity === 'legendary' ? <span className="game-ui-collect-card-foil" /> : null}
          </span>
          <span className="game-ui-collect-card-title">{title}</span>
          {caption ? <span className="game-ui-collect-card-caption">{caption}</span> : null}
          {pips ? <Pips filled={pips.filled} total={pips.total} /> : null}
        </span>
        <span className="game-ui-collect-card-glare" />
      </span>
      <span className="game-ui-collect-card-back" aria-hidden="true">
        {back ?? <DefaultBack />}
      </span>
    </button>
  );
}
