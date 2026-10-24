import { type ReactNode } from 'react';

import { Avatar } from '../../../game/Avatar/Avatar';

import { EmptyState } from '../../../feedback/EmptyState/EmptyState';

import { Progress } from '../../../feedback/Progress/Progress';

import { Button } from '../../../controls/Button/Button';

import { Checkbox } from '../../../controls/Checkbox/Checkbox';

import { Field } from '../../../controls/Field/Field';

import { Input } from '../../../controls/Input/Input';

import { TextArea } from '../../../controls/TextArea/TextArea';

import { Panel } from '../../../containers/Panel/Panel';
import { useCopy } from '../context';

export function FormsAndDisplay(): ReactNode {
  const { forms: copy } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <Panel title={copy.formsTitle} tone="strong">
        <Field hint={copy.roomCodeHint} label={copy.roomCodeLabel}>
          <Input placeholder={copy.roomCodePlaceholder} />
        </Field>
        <Field label={copy.nameLabel} required>
          <Input placeholder={copy.namePlaceholder} />
        </Field>
        <Field error={copy.readError} label={copy.readLabel}>
          <TextArea invalid placeholder={copy.readPlaceholder} />
        </Field>
        <Checkbox defaultChecked label={copy.rememberLabel} />
      </Panel>
      <Panel title={copy.displayTitle} tone="strong">
        <div className="game-ui-component-row">
          <Avatar name="Mika Ono" status="online" />
          <Avatar name="River" size="lg" status="busy" />
          <Avatar name="Noa" status="away" />
          <Avatar name={copy.guestName} size="sm" />
        </div>
        <Progress label={copy.revealLabel} showValue value={64} />
        <Progress label={copy.batteryLabel} max={20} showValue value={14} />
        <EmptyState
          action={<Button variant="primary">{copy.emptyCta}</Button>}
          description={copy.emptyBody}
          icon="scroll"
          title={copy.emptyTitle}
        />
      </Panel>
    </div>
  );
}
