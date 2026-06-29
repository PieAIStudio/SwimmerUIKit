# PLAN-0012 contractor UI pack design

## Scope

This pack adds official SwimmerUIKit surfaces for AI contractor and construction robot flows used by game surfaces. The components are global UI primitives, not OwnMySpace-specific runtime code. Host apps own job state, construction commands, generated assets, scene mutation, save/reload, persistence, provider transport, and budget enforcement.

## Adapt-mode source fit

The implementation adapts the existing SwimmerUIKit game surface pattern rather than creating a parallel UI system. It reuses `GamePanel`, `GameButton`, `GameActionGrid`, `GameProgress`, `GameBadge`, `GameSegmentedControl`, `GameAssetIcon`, and the existing `GameCompactGameDrawer` drawer primitive. The new layer only contributes contractor-specific composition, data contracts, status mapping, validation display, robot crew display, and before/after review affordances.

## Components

- `GameContractorPanel`: full queue/detail panel for desktop/tablet, compact drawer plus selected job card for mobile.
- `GameConstructionJobCard`: reusable job card for draft, preview, queued, working, blocked, ready-for-review, accepted, and cancelled jobs.
- `GameConstructionProgress`: progress meter with status badge, optional step ledger, and validation warnings.
- `GameConstructionApprovalBar`: default approve/cancel/revise/revert actions, provider boundary badges, and validation count.
- `GameRobotCrewStatus`: construction robot roster with role, task, and status.
- `GameBeforeAfterToggle`: before/after review switch for owner approval.
- `GameCompactJobDrawer`: contractor-specific wrapper over `GameCompactGameDrawer` for mobile HUD use.

## Status and action model

`GameConstructionJobStatus` covers:

```ts
'draft'
'preview'
'queued'
'working'
'blocked'
'readyForReview'
'accepted'
'cancelled'
```

Default actions are intentionally conservative:

- `draft`: preview, revise, cancel.
- `preview`: approve, revise, cancel.
- `queued`: cancel.
- `working`: cancel.
- `blocked`: revise, revert, cancel.
- `readyForReview`: approve, revise, revert.
- `accepted`: revert.
- `cancelled`: revert.

Hosts can override actions per job through `job.actions`. Action callbacks emit `(actionId, jobId)`; the UI kit does not mutate runtime state.

## Provider and budget boundary

The UI supports `providerMode` badges:

- `local-only`: shows that the construction work is local or dry-run only.
- `mock`: marks local mock provider or simulated queue work.
- `paid-disabled`: makes a disabled paid-provider boundary visible.

The package does not import provider clients, secrets, SwimmerAIKit, OwnMySpace stores, or persistence APIs.

## Responsive behavior

Desktop and tablet render a queue/detail grid. Mobile and small-mobile render `GameCompactJobDrawer` plus a selected dense job card. Small-mobile hides long progress step ledgers by default while keeping captions, badges, validation warning text, and accessible labels visible. Touch targets continue to inherit the existing 44px minimum SwimmerUIKit control baseline.

## Accessibility and game UI notes

Buttons use semantic `button` elements, `aria-pressed` for selected job/state controls, `role="progressbar"` through `GameProgress`, and `role="alert"` for warning/danger validation rows. Color is not the only status signal: status rows include icon, badge text, and copy. Reduced-motion behavior is inherited from global SwimmerUIKit CSS and the new block avoids animation-specific requirements.

## ScreenWalk frame

- surface_type: mixed, with game HUD/detail segments.
- user: host player or builder reviewing local contractor jobs.
- goal: understand current construction state, inspect validation, approve/revise/revert/cancel, and keep mobile HUD usable.
- success standard: no OwnMySpace runtime dependency, all required states visible, mobile drawer available, progress and validation warnings readable, and verification commands pass.
- coverage: component/story/preview screenshots once Storybook screenshots are generated.

## Files

- `src/GameContractorTools.tsx`
- `src/GameContractorTools.test.tsx`
- `src/stories/GameContractorTools.stories.tsx`
- `src/GameUiPreview.tsx`
- `src/styles.css`
- `src/index.ts`
- `README.md`
