import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameSegmentedControl } from '../../../controls/GameSegmentedControl/GameSegmentedControl';
import {
  type GameBeforeAfterView,
  type GameConstructionPreviewPane,
  type GameConstructionVariant,
} from '../model';

export interface GameBeforeAfterToggleProps {
  activeView: GameBeforeAfterView;
  after: GameConstructionPreviewPane;
  before: GameConstructionPreviewPane;
  className?: string | undefined;
  label: string;
  onViewChange?: ((view: GameBeforeAfterView) => void) | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

export function GameBeforeAfterToggle({
  activeView,
  after,
  before,
  className,
  label,
  onViewChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameBeforeAfterToggleProps): ReactNode {
  const classes = ['game-ui-before-after-toggle', className].filter(Boolean).join(' ');
  const activePane = activeView === 'before' ? before : after;

  return (
    <section
      aria-label={label}
      className={classes}
      data-active-view={activeView}
      data-ui-hook="before-after-toggle"
      data-variant={variant}
      data-testid={testId}
    >
      <GameSegmentedControl
        activeId={activeView}
        label={`${label} view`}
        {...(onViewChange
          ? { onSelect: (view: string) => onViewChange(view as GameBeforeAfterView) }
          : {})}
        options={[
          { id: 'before', label: before.label },
          { id: 'after', label: after.label },
        ]}
      />
      <figure className="game-ui-before-after-preview">
        {activePane.content ? (
          <div className="game-ui-before-after-content">{activePane.content}</div>
        ) : (
          <div aria-hidden="true" className="game-ui-before-after-placeholder">
            <GameAssetIcon icon={activeView === 'before' ? 'home' : 'check'} size="xl" />
          </div>
        )}
        {activePane.caption ? <figcaption>{activePane.caption}</figcaption> : null}
      </figure>
    </section>
  );
}
