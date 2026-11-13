import type { ReactNode } from 'react';
import { Badge } from '@pieai/swimmer-ui-kit';
import type { KitManifest, ShowcaseLanguage } from './types';

export interface StatusListProps {
  kit: Pick<KitManifest, 'status' | 'version' | 'lastRelease' | 'updates'>;
  language?: ShowcaseLanguage;
  statusTitle?: string;
  updatesTitle?: string;
}
export function StatusList({
  kit,
  language = 'en',
  statusTitle = 'Status',
  updatesTitle = 'Updates',
}: StatusListProps): ReactNode {
  const text = (value: { en: string; zh: string }) => value[language];
  const zh = language === 'zh';
  return (
    <div className="game-ui-showcase-status-list">
      <section className="game-ui-showcase-rail-block">
        <h2>{statusTitle}</h2>
        <dl>
          <div>
            <dt>{text(kit.status.label)}</dt>
            <dd>
              <Badge tone={kit.status.tone ?? 'neutral'}>{kit.status.value}</Badge>
            </dd>
          </div>
          <div>
            <dt>{zh ? '版本' : 'Version'}</dt>
            <dd>
              <code>{kit.version}</code>
            </dd>
          </div>
          <div>
            <dt>{zh ? '最近发布' : 'Last release'}</dt>
            <dd>{kit.lastRelease}</dd>
          </div>
        </dl>
      </section>
      <section className="game-ui-showcase-rail-block">
        <h2>{updatesTitle}</h2>
        <ul>
          {kit.updates.slice(0, 3).map((update) => (
            <li key={update.date}>
              <time>{update.date}</time>
              <span>{text(update.text)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
