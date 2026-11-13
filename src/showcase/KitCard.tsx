import type { ReactNode } from 'react';
import { Badge } from '../feedback/Badge/Badge';
import type { KitManifest } from './types';

export interface KitCardProps {
  kit: Pick<KitManifest, 'name' | 'tagline' | 'type' | 'version' | 'status'>;
  language?: 'en' | 'zh';
  href?: string;
}
export function KitCard({ href, kit, language = 'en' }: KitCardProps): ReactNode {
  const content = (
    <>
      <div className="game-ui-showcase-kit-card__top">
        <strong>{kit.name}</strong>
        <Badge tone={kit.status.tone ?? 'neutral'}>{kit.status.value}</Badge>
      </div>
      <p>{kit.tagline[language]}</p>
      <small>
        {kit.type} · v{kit.version}
      </small>
    </>
  );
  return href ? (
    <a className="game-ui-showcase-kit-card" href={href}>
      {content}
    </a>
  ) : (
    <article className="game-ui-showcase-kit-card">{content}</article>
  );
}
