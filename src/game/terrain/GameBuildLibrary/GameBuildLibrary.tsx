import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge, type GameBadgeTone } from '../../../feedback/GameBadge/GameBadge';

import { GameEmptyState } from '../../../feedback/GameEmptyState/GameEmptyState';

import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import {
  type GameBuildCategory,
  type GameTerrainBuildVariant,
  type GameBuildItemStatus,
} from '../model';
import { TOOL_ICONS } from '../shared';

export interface GameBuildLibraryProps {
  activeCategoryId?: string | undefined;
  categories: readonly GameBuildCategory[];
  className?: string;
  density?: GameSurfaceDensity;
  emptyDescription?: string;
  emptyTitle?: string;
  label: string;
  onCategoryChange?: ((categoryId: string) => void) | undefined;
  onSelectItem?: ((itemId: string, categoryId: string) => void) | undefined;
  selectedItemId?: string | undefined;
  title: string;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

const BUILD_STATUS_TONES: Readonly<Record<GameBuildItemStatus, GameBadgeTone>> = {
  error: 'danger',
  locked: 'warning',
  missing: 'danger',
  progress: 'ai',
  ready: 'neutral',
  selected: 'success',
};

export function GameBuildLibrary({
  activeCategoryId,
  categories,
  className,
  density = 'comfortable',
  emptyDescription = 'Building pieces will appear here when a category is available.',
  emptyTitle = 'No build pieces ready',
  label,
  onCategoryChange,
  onSelectItem,
  selectedItemId,
  title,
  variant = 'desktop',
  'data-testid': testId,
}: GameBuildLibraryProps): ReactNode {
  const classes = ['game-ui-build-library', className].filter(Boolean).join(' ');
  const enabledCategories = categories.filter((category) => !category.disabled);
  const resolvedActiveCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    enabledCategories[0] ??
    categories[0];
  const items = resolvedActiveCategory?.items ?? [];
  const isRail = variant === 'small-mobile';

  return (
    <GamePanel
      className={classes}
      data-ui-hook="build-library"
      data-variant={variant}
      data-testid={testId}
      title={title}
      tone="strong"
    >
      <section aria-label={label} data-density={density}>
        <div aria-label="Build categories" className="game-ui-build-categories" role="tablist">
          {categories.map((category) => {
            const selected = category.id === resolvedActiveCategory?.id;
            const categoryLabel =
              variant === 'small-mobile'
                ? (category.compactLabel ?? category.label)
                : category.label;
            return (
              <button
                aria-controls={`${category.id}-build-panel`}
                aria-label={category.label}
                aria-selected={selected}
                className="game-ui-build-category"
                data-build-category-id={category.id}
                disabled={category.disabled}
                key={category.id}
                onClick={
                  onCategoryChange && !category.disabled
                    ? () => onCategoryChange(category.id)
                    : undefined
                }
                role="tab"
                type="button"
              >
                <GameAssetIcon
                  icon={category.icon ?? TOOL_ICONS[category.id] ?? 'home'}
                  size="sm"
                  style="line"
                />
                <span>{categoryLabel}</span>
                {category.meta ? <small>{category.meta}</small> : null}
              </button>
            );
          })}
        </div>
        {items.length === 0 || !resolvedActiveCategory ? (
          <GameEmptyState description={emptyDescription} icon="home" title={emptyTitle} />
        ) : (
          <div
            aria-label={`${resolvedActiveCategory.label} pieces`}
            className="game-ui-build-items"
            data-card-layout={isRail ? 'rail' : 'list'}
            id={`${resolvedActiveCategory.id}-build-panel`}
            role="tabpanel"
          >
            {items.map((item) => {
              const selected = item.id === selectedItemId || item.status === 'selected';
              const status = selected ? 'selected' : (item.status ?? 'ready');
              const itemDisabled = Boolean(
                item.disabled || status === 'locked' || status === 'missing',
              );
              const itemLabel = isRail ? (item.compactLabel ?? item.label) : item.label;
              return (
                <button
                  aria-label={`${item.label}, ${status}`}
                  aria-pressed={selected}
                  className="game-ui-build-item"
                  data-build-category-id={resolvedActiveCategory.id}
                  data-build-item-id={item.id}
                  data-build-item-status={status}
                  disabled={itemDisabled}
                  key={item.id}
                  onClick={
                    onSelectItem && !itemDisabled
                      ? () => onSelectItem(item.id, resolvedActiveCategory.id)
                      : undefined
                  }
                  type="button"
                >
                  <span className="game-ui-build-item-icon">
                    {item.previewSrc ? (
                      <img
                        alt={item.previewAlt ?? ''}
                        className="game-ui-build-item-preview"
                        src={item.previewSrc}
                      />
                    ) : (
                      <GameAssetIcon
                        icon={item.icon ?? resolvedActiveCategory.icon ?? 'home'}
                        size={isRail ? 'sm' : 'md'}
                      />
                    )}
                  </span>
                  <span className="game-ui-build-item-copy">
                    <span className="game-ui-build-item-badges">
                      <GameBadge tone={BUILD_STATUS_TONES[status]}>{status}</GameBadge>
                      {item.badges?.map((badge) => (
                        <GameBadge key={badge.label} tone={badge.tone ?? 'neutral'}>
                          {badge.label}
                        </GameBadge>
                      ))}
                    </span>
                    <strong>{itemLabel}</strong>
                    {item.description ? <span>{item.description}</span> : null}
                    {item.meta ? <small>{item.meta}</small> : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </GamePanel>
  );
}
