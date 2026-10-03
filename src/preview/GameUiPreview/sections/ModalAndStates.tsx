import { type ReactNode } from 'react';
import { GameHudActions } from '../../../containers/GameHudActions/GameHudActions';

import { GameLoadingState } from '../../../feedback/GameLoadingState/GameLoadingState';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GameDialog } from '../../../containers/GameDialog/GameDialog';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import { GameToast } from '../../../feedback/GameToast/GameToast';
import { useCopy } from '../context';

export function ModalAndStates(): ReactNode {
  const { modals: m } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GameDialog title={m.dialogTitle}>
        <p>{m.dialogBody}</p>
        <GameHudActions label={m.actionsLabel}>
          <GameButton variant="primary">{m.confirm}</GameButton>
          <GameButton variant="ghost">{m.back}</GameButton>
        </GameHudActions>
      </GameDialog>
      <GamePanel title={m.panelTitle} tone="strong">
        <GameToast tone="success">{m.toastOk}</GameToast>
        <GameToast tone="danger">{m.toastErr}</GameToast>
        <GameLoadingState label={m.loading} />
        <GameLoadingState label={m.loadingErr} tone="error" />
      </GamePanel>
    </div>
  );
}
