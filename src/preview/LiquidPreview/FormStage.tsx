import { type ReactNode } from 'react';

import { LIQUID_FORMS, type LiquidForm } from '../../liquid/forms';
import { BodyStage } from './BodyStage';
import { GroupStage } from './GroupStage';

export function FormStage({
  form,
  engaged,
  fill,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill: string;
}): ReactNode {
  return LIQUID_FORMS[form].kind === 'body' ? (
    <BodyStage engaged={engaged} fill={fill} form={form} />
  ) : (
    <GroupStage engaged={engaged} fill={fill} form={form} />
  );
}
