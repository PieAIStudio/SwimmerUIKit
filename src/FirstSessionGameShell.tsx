import type { ReactNode } from 'react';

import { GameAssetIcon, GameBadge, GameHud } from './ClayComponents';
import { GameButton } from './GameButton';
import { GameHudActions } from './GameHudActions';
import type { ClayIconName } from './clay/assets';

export interface FirstSessionHudLabels {
  controls: string;
  emote: string;
  goalLabel: string;
  goalValue: string;
  history: string;
  hud: string;
  input: string;
  moveBadge: string;
  move: string;
  roomLabel: string;
  roomValue: string;
  roleLabel: string;
  roleValue: string;
  settings: string;
  shell: string;
  timerLabel: string;
  timerValue: string;
  tools: string;
  wardrobe: string;
}

export interface FirstSessionHudIconSlots {
  history?: ReactNode;
  input?: ReactNode;
  settings?: ReactNode;
  wardrobe?: ReactNode;
  emote?: ReactNode;
}

export interface FirstSessionHudProps {
  authenticated: boolean;
  batteryCount: number | string;
  className?: string;
  dailyStreak: number;
  iconSlots?: FirstSessionHudIconSlots;
  labels: FirstSessionHudLabels;
  onHistory: () => void;
  onSettings: () => void;
  onWardrobe: () => void;
  playerName: string;
}

function SlotIcon({ fallback, slot }: { fallback: ClayIconName; slot?: ReactNode }): ReactNode {
  return slot ?? <GameAssetIcon icon={fallback} size="sm" />;
}

export function FirstSessionHud({ authenticated, batteryCount, className, dailyStreak, iconSlots, labels, onHistory, onSettings, onWardrobe, playerName }: FirstSessionHudProps): ReactNode {
  const classes = ['swimmer-first-session-shell', className].filter(Boolean).join(' ');
  const resourceMeta = authenticated ? `${batteryCount} 🔋` : 'guest';

  return (
    <section aria-label={labels.shell} className={classes}>
      <GameHud
        className="swimmer-first-session-hud"
        items={[
          { icon: 'crown', id: 'role', label: labels.roleLabel, meta: playerName, value: labels.roleValue },
          { icon: 'portal', id: 'room', label: labels.roomLabel, meta: resourceMeta, value: labels.roomValue },
          { icon: 'trophy', id: 'goal', label: labels.goalLabel, meta: `Daily ${dailyStreak}`, value: labels.goalValue },
          { icon: 'timer', id: 'timer', label: labels.timerLabel, value: labels.timerValue },
        ]}
        label={labels.hud}
        actions={(
          <GameHudActions className="swimmer-first-session-hud-actions" label={labels.tools}>
            <GameButton aria-label={labels.wardrobe} onClick={onWardrobe} variant="secondary">
              <SlotIcon fallback="shirt" slot={iconSlots?.wardrobe} />
              {labels.wardrobe}
            </GameButton>
            <GameButton aria-label={labels.settings} onClick={onSettings} variant="secondary">
              <SlotIcon fallback="settings" slot={iconSlots?.settings} />
              {labels.settings}
            </GameButton>
            <GameButton aria-label={labels.history} onClick={onHistory} variant="secondary">
              <SlotIcon fallback="history" slot={iconSlots?.history} />
              {labels.history}
            </GameButton>
          </GameHudActions>
        )}
      />

      <div aria-label={labels.controls} className="swimmer-first-session-controls">
        <div aria-hidden="true" className="swimmer-first-session-joystick">
          <span />
        </div>
        <div className="swimmer-first-session-control-copy">
          <GameBadge tone="ai">{labels.moveBadge}</GameBadge>
          <strong>{labels.move}</strong>
        </div>
        <label className="swimmer-first-session-input">
          <SlotIcon fallback="chat" slot={iconSlots?.input} />
          <span>{labels.input}</span>
        </label>
        <button className="swimmer-first-session-emote" type="button">
          <SlotIcon fallback="smile" slot={iconSlots?.emote} />
          {labels.emote}
        </button>
      </div>
    </section>
  );
}

export interface FirstSessionOnboardingStep {
  body: string;
  title: string;
}

export interface FirstSessionOnboardingLabels {
  badge: string;
  body: string;
  skip: string;
  start: string;
  steps: readonly FirstSessionOnboardingStep[];
  title: string;
}

export interface FirstSessionOnboardingProps {
  labels: FirstSessionOnboardingLabels;
  onDismiss: () => void;
  open: boolean;
}

export function FirstSessionOnboarding({ labels, onDismiss, open }: FirstSessionOnboardingProps): ReactNode {
  if (!open) return null;

  return (
    <aside aria-labelledby="swimmer-first-session-onboarding-title" aria-modal="true" className="swimmer-first-session-onboarding" role="dialog">
      <div className="swimmer-first-session-onboarding-scrim" />
      <div className="swimmer-first-session-onboarding-card">
        <GameAssetIcon icon="trophy" size="xl" />
        <GameBadge tone="warning">{labels.badge}</GameBadge>
        <h2 id="swimmer-first-session-onboarding-title">{labels.title}</h2>
        <p>{labels.body}</p>
        <ol className="swimmer-first-session-onboarding-steps">
          {labels.steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.title}</strong>
              <small>{step.body}</small>
            </li>
          ))}
        </ol>
        <div className="swimmer-first-session-onboarding-actions">
          <GameButton onClick={onDismiss} variant="primary">{labels.start}</GameButton>
          <GameButton onClick={onDismiss} variant="ghost">{labels.skip}</GameButton>
        </div>
      </div>
    </aside>
  );
}
