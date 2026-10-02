import { LiquidGroup, liquidFormItem, GameMaterialSwatches } from '../../src/index';
import { LiquidEffectsGroup } from '../../src/liquid-effects';
import { GameUiPreview } from '../../src/preview';

// Checked by pnpm typecheck; these fixtures are not bundle entries.
export const ordinary = (
  <LiquidGroup>
    <LiquidGroup.Item {...liquidFormItem('press')}>Text</LiquidGroup.Item>
  </LiquidGroup>
);
export const imageEffect = (
  <LiquidEffectsGroup>
    <LiquidEffectsGroup.Item effect="melt" melt={{ mix: 0.5 }}>
      <img alt="Example" src="example.png" />
    </LiquidEffectsGroup.Item>
  </LiquidEffectsGroup>
);
export const bendEffect = (
  <LiquidEffectsGroup>
    <LiquidEffectsGroup.Item effect="bend" bend={{ horizontal: 0.2 }}>
      Text
    </LiquidEffectsGroup.Item>
  </LiquidEffectsGroup>
);
export const imageDissolve = (
  <LiquidEffectsGroup>
    <LiquidEffectsGroup.Item dissolve={{ strength: 0.5 }}>
      <img alt="Example" src="example.png" />
    </LiquidEffectsGroup.Item>
  </LiquidEffectsGroup>
);
export const showroom = <GameUiPreview />;
export const palette = (
  <GameMaterialSwatches
    label="Palette"
    materials={[{ id: 'sky', label: 'Sky', color: '#6bb3ea' }]}
  />
);

// @ts-expect-error Image effects are not part of the default group API.
export const rejectedMelt = <LiquidGroup.Item effect="melt">Text</LiquidGroup.Item>;
// @ts-expect-error Bend requires the optional effect entry.
export const rejectedBend = <LiquidGroup.Item bend={{ horizontal: 0.2 }}>Text</LiquidGroup.Item>;
// @ts-expect-error Image contact effects cannot silently enter the core.
export const rejectedDissolve = <LiquidGroup.Item dissolve>Text</LiquidGroup.Item>;
// @ts-expect-error The internal layer seam is not a public plugin escape hatch.
export const rejectedLayer = <LiquidGroup auxiliary={() => null}>Text</LiquidGroup>;
