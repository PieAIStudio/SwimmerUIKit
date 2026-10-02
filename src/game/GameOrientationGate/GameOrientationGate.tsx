import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { useEffect, useState, type ReactNode } from 'react';
import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';
import { GameBadge } from '../../feedback/GameBadge/GameBadge';

function isPortraitPhoneLike(): boolean {
  if (typeof window === 'undefined') return false;
  const phoneLike =
    window.matchMedia?.('(pointer: coarse), (max-width: 899px)').matches ?? window.innerWidth < 900;
  return phoneLike && window.innerHeight > window.innerWidth;
}

export interface GameOrientationGateProps {
  body: string;
  cta: string;
  /** Warning badge text. Defaults to "Landscape only". */
  badgeLabel?: string;
  /** Hint shown when the browser blocks the automatic landscape lock. */
  manualHint?: string;
  preview?: boolean;
  title: string;
}

export function GameOrientationGate({
  body,
  cta,
  badgeLabel = 'Landscape only',
  manualHint = 'Rotate manually if this browser blocks automatic landscape lock.',
  preview = false,
  title,
}: GameOrientationGateProps): ReactNode {
  const [visible, setVisible] = useState(preview || isPortraitPhoneLike);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preview) return undefined;
    const update = () => {
      const nextVisible = isPortraitPhoneLike();
      setVisible(nextVisible);
      if (!nextVisible) setMessage('');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [preview]);

  if (!visible) return null;

  const attemptLandscape = async () => {
    setMessage('');
    if (preview) return;
    try {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) await root.requestFullscreen();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: 'landscape-primary') => Promise<void>;
      };
      await orientation.lock?.('landscape-primary');
      setVisible(isPortraitPhoneLike());
    } catch {
      setMessage(manualHint);
    }
  };

  return (
    <aside aria-label={title} className="game-ui-orientation-gate">
      <div className="game-ui-orientation-card">
        <GameAssetIcon icon="mobile" size="xl" />
        <GameBadge tone="warning">{badgeLabel}</GameBadge>
        <h2>{title}</h2>
        <p>{body}</p>
        <button onClick={() => void attemptLandscape()} type="button" data-game-ui-paint="">
          <DropletSurface />
          {cta}
        </button>
        {message ? <small>{message}</small> : null}
      </div>
    </aside>
  );
}
