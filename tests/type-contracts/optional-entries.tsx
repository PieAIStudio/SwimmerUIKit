import { LiquidGroup, liquidFormItem, GameMaterialSwatches } from '../../src/index';
import { LiquidEffectsGroup } from '../../src/liquid-effects';
import { GameUiPreview } from '../../src/preview';
import { GameButton, GameIconButton, GameSelect, GameToggle } from '../../src/index';
import { LiquidReveal } from '../../src/liquid-presence';

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
// @ts-expect-error The primary action chooses liquid; the surface axis is removed.
export const rejectedSurface = <GameButton surface="liquid">Start</GameButton>;
// @ts-expect-error No old finish selector is retained for primitive groups.
export const rejectedFinish = <LiquidGroup liquidFinish="matte">Text</LiquidGroup>;
export const rejectedPlaque = (
  // @ts-expect-error Ordinary icon controls cannot opt back into liquid or plaque.
  <GameIconButton label="Icon" surface="plaque">
    +
  </GameIconButton>
);
export const rejectedSelect = (
  // @ts-expect-error Native fields no longer have a liquid renderer.
  <GameSelect surface="liquid">
    <option>One</option>
  </GameSelect>
);
// @ts-expect-error Toggle state is not a choice of material.
export const rejectedToggle = <GameToggle checked label="Sound" liquidFinish="glossy" />;
// @ts-expect-error Reveal has one shared material, not a second dark-surface mode.
export const rejectedReveal = <LiquidReveal surface="dark">Draft</LiquidReveal>;
