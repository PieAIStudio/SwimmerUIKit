import type { ReactNode } from 'react';
import { Gem } from '../../controls/Gem/Gem';
import { getToolHero3DRenderer } from '../../hero3d/registry';
import type { ToolLandingHero3DModel } from '../../hero3d/model';
import { joinClasses } from '../shared/classes';

export interface ToolLandingFeature {
  description?: ReactNode;
  icon: ReactNode;
  id: string;
  title: ReactNode;
}

export interface ToolLandingProps {
  art: ReactNode;
  className?: string;
  features: readonly ToolLandingFeature[];
  lead: ReactNode;
  model?: ToolLandingHero3DModel;
  title: ReactNode;
}

/** Landing composition: world-colour art glow, light title, lead and three features. */
export function ToolLanding({
  art,
  className,
  features,
  lead,
  model,
  title,
}: ToolLandingProps): ReactNode {
  const HeroRenderer = model ? getToolHero3DRenderer() : undefined;
  const hero = model && HeroRenderer ? <HeroRenderer model={model} /> : art;

  return (
    <section className={joinClasses('game-ui-tool-landing', className)} data-tool-part="landing">
      <div aria-hidden="true" className="game-ui-tool-landing-art">
        <div className="game-ui-tool-landing-art-glow" />
        <div className="game-ui-tool-landing-art-content">{hero}</div>
      </div>
      <div className="game-ui-tool-landing-words">
        <h1>{title}</h1>
        <p className="game-ui-tool-landing-lead">{lead}</p>
        <div className="game-ui-tool-landing-features">
          {features.map((feature) => (
            <div className="game-ui-tool-landing-feature" key={feature.id}>
              <Gem>{feature.icon}</Gem>
              <div>
                <strong>{feature.title}</strong>
                {feature.description ? <small>{feature.description}</small> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
