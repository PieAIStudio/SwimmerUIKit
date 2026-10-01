import { type ReactNode } from 'react';

import { LiquidMetalButton } from '../../../controls/LiquidMetalButton/LiquidMetalButton';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import { useCopy } from '../context';

export function LiquidMetalCompare(): ReactNode {
  const { liquidMetal } = useCopy();
  return (
    <div className="game-ui-liquid-metal-compare">
      <GamePanel title={liquidMetal.cssTitle} tone="strong">
        <div className="game-ui-liquid-metal-stage">
          <LiquidMetalButton renderer="css">{liquidMetal.cta}</LiquidMetalButton>
        </div>
      </GamePanel>
      <GamePanel title={liquidMetal.webglTitle} tone="strong">
        <div className="game-ui-liquid-metal-stage">
          <LiquidMetalButton renderer="webgl">{liquidMetal.cta}</LiquidMetalButton>
        </div>
      </GamePanel>
    </div>
  );
}
