import { type CSSProperties } from 'react';

import { type GameButtonVariant } from '../../controls/GameButton/GameButton';

export const TONES: readonly GameButtonVariant[] = ['primary', 'secondary', 'success', 'danger'];

/** The stage every form is shown on, so twelve tiles are actually comparable. */
export const STAGE: CSSProperties = { width: 132, height: 56 };

/**
 * One slot of the `follow` rail, in px.
 *
 * The marker's travel and the label cells have to be the same number or the
 * blob lands beside the word it is pointing at, which is the one mistake that
 * form can make.
 */
export const SLOT = 62;

/*
 * `ripple` is the one form a toggle cannot show.
 *
 * Every other form has an engaged state you can hold — pressed, landed, locked,
 * reaching. A shudder has no held state; its whole subject is that it happens
 * and dies out. So its trigger is a pulse that releases itself, and holding it
 * engaged would be showing a body stuck 4% wider, which is not the form.
 */
export const PULSE_MS = 520;
