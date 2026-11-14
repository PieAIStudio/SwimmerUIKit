import { Badge, type BadgeTone } from '@pieai/swimmer-ui-kit';
import type { ReactNode } from 'react';

export interface KitCardLabels {
  /** Translated status text; falls back to `kit.status.value`. */
  status?: string;
  /** Translated kit type; falls back to `kit.type`. */
  type?: string;
  /** Shown on linked cards, e.g. "Open showcase". */
  action?: string;
  /** Shown on cards without a link, e.g. "No showcase yet". */
  unavailable?: string;
}

export interface KitCardProps {
  kit: {
    name: string;
    tagline: { en: string; zh: string };
    type: string;
    /** Leave empty when the kit has no released version yet. */
    version: string;
    status: { value: string; tone?: BadgeTone };
  };
  language?: 'en' | 'zh';
  href?: string;
  labels?: KitCardLabels;
}

export function KitCard({ href, kit, labels, language = 'en' }: KitCardProps): ReactNode {
  const version = kit.version.trim();
  const content = (
    <>
      <div className="game-ui-showcase-kit-card__top">
        <strong>{kit.name}</strong>
        <Badge tone={kit.status.tone ?? 'neutral'}>
          <span
            className="game-ui-showcase-kit-card__dot"
            data-tone={kit.status.tone ?? 'neutral'}
            aria-hidden="true"
          />
          {labels?.status ?? kit.status.value}
        </Badge>
      </div>
      <p>{kit.tagline[language]}</p>
      <div className="game-ui-showcase-kit-card__foot">
        <small>
          {labels?.type ?? kit.type}
          {version ? ` · v${version}` : null}
        </small>
        {href && labels?.action ? (
          <span className="game-ui-showcase-kit-card__action">
            {labels.action}
            <span aria-hidden="true">→</span>
          </span>
        ) : !href && labels?.unavailable ? (
          <span className="game-ui-showcase-kit-card__unavailable">{labels.unavailable}</span>
        ) : null}
      </div>
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
