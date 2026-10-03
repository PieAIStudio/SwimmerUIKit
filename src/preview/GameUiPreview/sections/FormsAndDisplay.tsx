import { type ReactNode } from 'react';

import { GameAvatar } from '../../../game/GameAvatar/GameAvatar';

import { GameEmptyState } from '../../../feedback/GameEmptyState/GameEmptyState';

import { GameProgress } from '../../../feedback/GameProgress/GameProgress';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GameCheckbox } from '../../../controls/GameCheckbox/GameCheckbox';

import { GameField } from '../../../controls/GameField/GameField';

import { GameInput } from '../../../controls/GameInput/GameInput';

import { GameTextArea } from '../../../controls/GameTextArea/GameTextArea';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import { useCopy } from '../context';

export function FormsAndDisplay(): ReactNode {
  const { forms: copy } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title={copy.formsTitle} tone="strong">
        <GameField hint={copy.roomCodeHint} label={copy.roomCodeLabel}>
          <GameInput placeholder={copy.roomCodePlaceholder} />
        </GameField>
        <GameField label={copy.nameLabel} required>
          <GameInput placeholder={copy.namePlaceholder} />
        </GameField>
        <GameField error={copy.readError} label={copy.readLabel}>
          <GameTextArea invalid placeholder={copy.readPlaceholder} />
        </GameField>
        <GameCheckbox defaultChecked label={copy.rememberLabel} />
      </GamePanel>
      <GamePanel title={copy.displayTitle} tone="strong">
        <div className="game-ui-component-row">
          <GameAvatar name="Mika Ono" status="online" />
          <GameAvatar name="River" size="lg" status="busy" />
          <GameAvatar name="Noa" status="away" />
          <GameAvatar name={copy.guestName} size="sm" />
        </div>
        <GameProgress label={copy.revealLabel} showValue value={64} />
        <GameProgress label={copy.batteryLabel} max={20} showValue value={14} />
        <GameEmptyState
          action={<GameButton variant="primary">{copy.emptyCta}</GameButton>}
          description={copy.emptyBody}
          icon="scroll"
          title={copy.emptyTitle}
        />
      </GamePanel>
    </div>
  );
}
