/*
 * The Liquid page.
 *
 * Liquid lived as one section inside the component dump, which was the right
 * place for it when there were six forms and one of them shipped. It is the
 * brand's signature surface and it keeps being upgraded, so the questions
 * someone actually has when they reach for it — which form says the thing I
 * mean, what does it look like at 14px, does the material survive a pale fill,
 * what happens in the dark theme — were spread across a page about everything
 * else. This page exists to answer those four questions in that order, and its
 * sections are that order rather than a tour of the API.
 *
 * Two things it deliberately does not do. It does not rank the forms, because
 * the right form is the one whose sentence matches the moment and no ordering
 * survives contact with a real screen. And it does not present the twelve as a
 * palette to decorate with: a form existing here is not permission to use it.
 * The recorded production finding is that gooey on a static solid block reads
 * as damage, and that one screen wants one liquid element carrying one layer
 * of intent. The header says so before anything is shown.
 */

export type Lang = 'en' | 'zh-CN';

export interface Copy {
  readonly triggerLabel: string;
  readonly langMenuLabel: string;
  readonly heroTitle: string;
  readonly heroBody: string;
  readonly heroRule: string;
  readonly sections: Readonly<Record<'shelf' | 'sizes' | 'tones' | 'states' | 'knobs', string>>;
  readonly shelfBody: string;
  readonly bodies: string;
  readonly groups: string;
  readonly bodiesHint: string;
  readonly groupsHint: string;
  readonly trigger: string;
  readonly reset: string;
  readonly pulse: string;
  readonly sizesBody: string;
  readonly control: string;
  readonly meter: string;
  readonly clamped: string;
  readonly tonesBody: string;
  readonly flat: string;
  readonly liquid: string;
  readonly statesBody: string;
  readonly rest: string;
  readonly engaged: string;
  readonly disabled: string;
  readonly disabledNote: string;
  readonly knobsBody: string;
  readonly knobRows: readonly (readonly [string, string])[];
  readonly tonePicker: string;
  readonly edgeNote: string;
  readonly lobesNote: string;
  readonly engagedKnob: string;
  readonly noShadow: string;
}
