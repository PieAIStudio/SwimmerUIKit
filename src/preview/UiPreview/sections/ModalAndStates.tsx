import { type ReactNode } from 'react';
import { HudActions } from '../../../containers/HudActions/HudActions';

import { LoadingState } from '../../../feedback/LoadingState/LoadingState';

import { Button } from '../../../controls/Button/Button';

import { Dialog } from '../../../containers/Dialog/Dialog';

import { Panel } from '../../../containers/Panel/Panel';

import { Toast } from '../../../feedback/Toast/Toast';
import { useCopy } from '../context';

export function ModalAndStates(): ReactNode {
  const { modals: m } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <Dialog title={m.dialogTitle}>
        <p>{m.dialogBody}</p>
        <HudActions label={m.actionsLabel}>
          <Button variant="primary">{m.confirm}</Button>
          <Button variant="ghost">{m.back}</Button>
        </HudActions>
      </Dialog>
      <Panel title={m.panelTitle} tone="strong">
        <Toast tone="success">{m.toastOk}</Toast>
        <Toast tone="danger">{m.toastErr}</Toast>
        <LoadingState label={m.loading} />
        <LoadingState label={m.loadingErr} tone="error" />
      </Panel>
    </div>
  );
}
