import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { liquidFinishGloss, type LiquidFinish } from './liquidGooeyFinish';

import { GameBadge, GameLanguageMenu } from './ClayComponents';
import { GameButton, type GameButtonVariant } from './GameButton';
import { GamePanel } from './GameSurfaces';
import { LiquidGroup } from './LiquidGroup';
import { LiquidSurface } from './LiquidSurface';
import {
  LIQUID_FORM_NAMES,
  LIQUID_FORMS,
  liquidFormGroup,
  liquidFormItem,
  type LiquidForm,
} from './liquidGooeyForms';
import { LIQUID_GOOEY_MIN_EDGE_RAMP, liquidGooeyEdgeContrast } from './liquidGooeyFilter';
import { parseShadow } from './liquidGooeyShadow';
import { LIQUID_BLOB_MAX_FRACTION } from './liquidGooeyGeometry';

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

type Lang = 'en' | 'zh-CN';
const FinishContext = createContext<LiquidFinish>('glossy');

interface Copy {
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

const COPY: Readonly<Record<Lang, Copy>> = {
  en: {
    triggerLabel: 'English',
    langMenuLabel: 'Page language',
    heroTitle: 'Liquid',
    heroBody:
      'A named look is a tested bundle of physics under a word that says what it means, so picking one is choosing a behaviour instead of configuring a filter. Every form below is live — trigger it.',
    heroRule:
      'One liquid element per screen, carrying one layer of intent. Liquid appears on a state change the user caused; there is no ambient, idle or decorative liquid, and gooey on a static solid block reads as damage rather than as material.',
    sections: {
      shelf: 'The vocabulary',
      sizes: 'The same form at two sizes',
      tones: 'The material on every fill',
      states: 'Rest, engaged, disabled — against the flat control',
      knobs: 'What the knobs actually do',
    },
    shelfBody:
      'Choose one body and one relationship to inspect. A body form goes into LiquidSurface; a relationship describes the space between siblings and needs LiquidGroup. The tone and finish pickers update the selected experiments, without mounting all twelve and exhausting the animation budget.',
    bodies: 'Bodies',
    groups: 'Relationships',
    bodiesHint: 'One silhouette. LiquidSurface draws these.',
    groupsHint: 'Two or more. The caller arranges the items; the goo does the neck.',
    trigger: 'Trigger',
    reset: 'Reset',
    pulse: 'Pulse',
    sizesBody:
      'A form fixes its amplitude once, and then lands on a 56px button and a 14px meter. It survives that because the pour is clamped to a share of the shorter side — without the clamp the same bold number that gives a button its shape dissolves a meter into a worm.',
    control: 'Control · 132×56',
    meter: 'Meter · 200×14',
    clamped: 'poured',
    tonesBody:
      'The material is lit, not painted, so it reads differently against a dark accent and a pale tint. Both have to work: tone says what an action means, and a destructive action is allowed to be liquid. Flip the theme in the bar above to check the other half — a shadow that is correct on cream is not automatically correct on brown.',
    flat: 'flat',
    liquid: 'liquid',
    statesBody:
      'The flat control is the reference the liquid one has to stand next to. Both carry weight: the flat button has a solid lip and a cast shadow, the liquid body has a seat and a cast that follow its poured outline and tighten when it is pressed.',
    rest: 'Rest',
    engaged: 'Engaged',
    disabled: 'Disabled',
    disabledNote:
      'A disabled control drops the liquid entirely rather than muting it. Liquid is how this kit says “press me”, and putting that on something that cannot be pressed is a lie told loudly.',
    knobsBody:
      'Four numbers and a shadow. None of them is a look on its own, which is why forms exist — but a form you are about to override is a form you need these for.',
    knobRows: [
      [
        'blur',
        'The merge radius: how far apart two silhouettes can be and still see each other as one body. A form about joining wants it large; a form about one crisp control wants it small.',
      ],
      [
        'contrast',
        'Not a look. The alpha crossing is pinned at 5/12 of the ramp, so contrast sets the edge WIDTH in pixels and nothing else: 2.5628 × blur ÷ contrast. Below about 1.3px the edge is thinner than the pixel drawing it, and the kit quietly lowers the contrast rather than letting that ship.',
      ],
      [
        'blob',
        'How far the outline pours outward, in px. Outward-only by construction, so the silhouette always contains the control’s own box and no amplitude can eat a label’s padding. This is path data, not a filter — exact at every device ratio.',
      ],
      ['lobes', 'How many swells go round the outline. 2 is lazy, 5 is busy.'],
      [
        'gloss',
        'Volume. The edge says “liquid” as an outline; this is what makes the inside of the body look like a material instead of a flat sticker.',
      ],
      [
        'shadow',
        'The ground. A tight, barely-offset seat says the body is touching; a wide low cast gives it height. A body with weight and no shadow is the one thing the eye refuses.',
      ],
    ],
    tonePicker: 'Tone',
    edgeNote: 'edge',
    lobesNote: 'lobes',
    engagedKnob: 'engaged',
    noShadow: 'none — the caller owns the ground',
  },
  'zh-CN': {
    triggerLabel: '简体中文',
    langMenuLabel: '页面语言',
    heroTitle: '液体',
    heroBody:
      '一个命名的形态，是一整套已经调好的物理参数，外面套一个能说清它是什么意思的词。所以选形态是在选一种行为，而不是在配一组滤镜。下面每一个都是活的——点一下试试。',
    heroRule:
      '一屏只放一个液体元素，只承载一层意图。液体只在用户造成的状态变化上出现；没有环境液体、待机液体或者装饰性液体。把胶质效果放在一块不动的实心方块上，看起来是坏了，不是材质。',
    sections: {
      shelf: '词汇表',
      sizes: '同一个形态，两个尺寸',
      tones: '每一种填色下的材质',
      states: '静止、触发、禁用——和扁平控件并排',
      knobs: '这些旋钮到底在控制什么',
    },
    shelfBody:
      '先选一个单体和一个多体关系查看。单体交给 LiquidSurface；关系描述兄弟元素之间的空隙，需要用 LiquidGroup 自己排布。色调与材质选择器改变当前实验，不把十二个同时挂载而耗尽动效预算。',
    bodies: '单体',
    groups: '关系',
    bodiesHint: '一个轮廓。LiquidSurface 画的就是这些。',
    groupsHint: '两个或更多。元素由调用方排布，胶质负责它们之间的颈。',
    trigger: '触发',
    reset: '复位',
    pulse: '弹一下',
    sizesBody:
      '一个形态只定一次振幅，然后它要同时落在 56px 的按钮和 14px 的进度条上。它扛得住，是因为外溢被夹在短边的一个比例内——没有这个夹子，同一个让按钮有形状的大数字，会把进度条化成一条虫。',
    control: '控件 · 132×56',
    meter: '进度条 · 200×14',
    clamped: '实际外溢',
    tonesBody:
      '材质是打光打出来的，不是涂出来的，所以它在深色主色和浅色淡彩上读起来不一样。两边都得成立：色调负责说明这个动作是什么意思，而危险动作也可以是液体的。用上面那栏切主题看另一半——在米色上对的阴影，在棕色上不会自动也对。',
    flat: '扁平',
    liquid: '液体',
    statesBody:
      '扁平控件是液体控件必须并排站着接受比较的那个参照。两边都有重量：扁平按钮有一道实心的唇和一层投影，液体身体有一道贴地的接触影和一层扩散影，都跟着它自己倒出来的轮廓走，被按下时会收紧。',
    rest: '静止',
    engaged: '触发',
    disabled: '禁用',
    disabledNote:
      '禁用的控件完全不穿液体，而不是把它调暗。液体是这套 UI 说「按我」的方式，把这句话放在按不动的东西上，是大声说一句假话。',
    knobsBody:
      '四个数字加一层阴影。单看每一个都不是一种「样子」，这正是形态存在的理由——但如果你正打算覆写某个形态，你就需要看懂它们。',
    knobRows: [
      [
        'blur',
        '融合半径：两个轮廓离多远还能互相认作同一个身体。讲「合并」的形态要大，讲「一个清晰控件」的形态要小。',
      ],
      [
        'contrast',
        '它不是一种样子。alpha 的跨越点被钉在斜坡的 5/12 处，所以 contrast 决定的只有边缘的宽度，单位是像素：2.5628 × blur ÷ contrast。低于约 1.3px，边缘就比画它的那个像素还细，这时 kit 会悄悄把 contrast 压下来，而不是让它这样发出去。',
      ],
      [
        'blob',
        '轮廓向外倒出去多远，单位 px。构造上只向外，所以轮廓永远包住控件自己的盒子，再大的振幅也吃不到文字的内边距。这是路径数据，不是滤镜——在任何设备像素比下都是精确的。',
      ],
      ['lobes', '轮廓上有几个鼓包。2 是懒散，5 是热闹。'],
      [
        'gloss',
        '体积。边缘用轮廓说「液体」；这个数负责让身体内部看起来是一种材质，而不是一张压平的贴纸。',
      ],
      [
        'shadow',
        '地面。一层几乎没有偏移的紧贴影说明它正接触着地面；一层又宽又低的扩散影给它高度。一个有重量却没有影子的身体，是眼睛唯一不肯接受的东西。',
      ],
    ],
    tonePicker: '色调',
    edgeNote: '边缘',
    lobesNote: '个鼓包',
    engagedKnob: '触发时',
    noShadow: '无 —— 地面由调用方决定',
  },
};

const TONES: readonly GameButtonVariant[] = ['primary', 'secondary', 'success', 'danger'];

/** The stage every form is shown on, so twelve tiles are actually comparable. */
const STAGE: CSSProperties = { width: 132, height: 56 };

/**
 * One slot of the `follow` rail, in px.
 *
 * The marker's travel and the label cells have to be the same number or the
 * blob lands beside the word it is pointing at, which is the one mistake that
 * form can make.
 */
const SLOT = 62;

/*
 * `ripple` is the one form a toggle cannot show.
 *
 * Every other form has an engaged state you can hold — pressed, landed, locked,
 * reaching. A shudder has no held state; its whole subject is that it happens
 * and dies out. So its trigger is a pulse that releases itself, and holding it
 * engaged would be showing a body stuck 4% wider, which is not the form.
 */
const PULSE_MS = 520;

function useFormEngagement(): [
  engaged: ReadonlySet<LiquidForm>,
  toggle: (form: LiquidForm) => void,
] {
  const [engaged, setEngaged] = useState<ReadonlySet<LiquidForm>>(new Set());
  const timers = useRef(new Map<LiquidForm, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const toggle = (form: LiquidForm): void => {
    const pulses = form === 'ripple';
    setEngaged((current) => {
      const next = new Set(current);
      if (next.has(form)) next.delete(form);
      else next.add(form);
      return next;
    });
    if (!pulses) return;
    clearTimeout(timers.current.get(form));
    timers.current.set(
      form,
      setTimeout(() => {
        setEngaged((current) => {
          const next = new Set(current);
          next.delete(form);
          return next;
        });
      }, PULSE_MS),
    );
  };

  return [engaged, toggle];
}

/*
 * Tone is a control on the shelf, not a section of its own.
 *
 * The obvious way to show twelve forms on four tones is forty-eight tiles, and
 * it is the wrong way: most forms are the same pill at rest, so the matrix
 * would be forty-eight near-identical pictures of the thing that does not vary,
 * and it would put forty-eight filtered groups on one page against an
 * animation budget that degrades the surplus to static — a showcase that
 * quietly stops showing. One picker recolours all twelve at once, so every
 * form really is available on every tone, live, and the page stays a page.
 *
 * The tokens are the ones `.game-ui-button-liquid--*` already maps to, so what
 * a reader picks here is what a product gets from `variant`.
 */
const TONE_FILL: Readonly<Record<GameButtonVariant, string>> = {
  primary: 'var(--game-ui-accent)',
  secondary: 'var(--game-ui-accent-pale)',
  success: 'var(--game-ui-success)',
  danger: 'var(--game-ui-danger)',
  ghost: 'var(--game-ui-accent-pale)',
};

/** A body form, drawn the way a product would draw it. */
function BodyStage({
  form,
  engaged,
  fill = 'var(--game-ui-accent)',
  style = STAGE,
  radius = 999,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill?: string;
  style?: CSSProperties;
  radius?: number;
}): ReactNode {
  const liquidFinish = useContext(FinishContext);
  return (
    <LiquidSurface
      liquidFinish={liquidFinish}
      active={engaged}
      fill={fill}
      form={form}
      radius={radius}
    >
      <span className="game-ui-liquid-page__body" style={style} />
    </LiquidSurface>
  );
}

/*
 * The relationship forms, each with the smallest arrangement that shows what it
 * says. These are hand-built rather than driven by a table because the whole
 * point of a relationship form is that the caller arranges the items — a
 * generic harness would be inventing an arrangement and then presenting it as
 * the form, which is the thing the `kind` split exists to stop.
 */
function GroupStage({
  form,
  engaged,
  fill,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill: string;
}): ReactNode {
  const finish = useContext(FinishContext);
  const group = liquidFormGroup(form);
  const item = liquidFormItem(form);
  const shared = {
    blur: group.blur,
    contrast: group.contrast,
    filterPadding: group.filterPadding,
    fill,
    gloss: liquidFinishGloss(finish, group.gloss),
  };
  const itemProps = {
    ...(item.effect === undefined ? {} : { effect: item.effect }),
    ...(item.morph === undefined ? {} : { morph: item.morph }),
    ...(item.transition === undefined ? {} : { transition: item.transition }),
    ...(group.blob > 0 ? { blob: { amplitude: group.blob, lobes: group.lobes } } : {}),
  };
  const dot = (size: number): CSSProperties => ({ width: size, height: size, display: 'block' });

  if (form === 'merge' || form === 'split') {
    // Merge closes the gap, split opens it. Same two bodies, read in opposite
    // directions, which is exactly what the two forms are.
    const apart = form === 'merge' ? (engaged ? 0 : 30) : engaged ? 32 : 0;
    return (
      <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
        <LiquidGroup.Item {...itemProps} radius={999} x={-apart}>
          <span style={dot(46)} />
        </LiquidGroup.Item>
        <LiquidGroup.Item {...itemProps} radius={999} x={apart}>
          <span style={dot(46)} />
        </LiquidGroup.Item>
      </LiquidGroup>
    );
  }

  if (form === 'follow') {
    /*
     * A marker needs somewhere to go, or it is just a rounded rectangle that
     * slides. The three slots are plain DOM on the crisp layer above the goo —
     * the same division every liquid surface in the kit uses, and the reason
     * the marker can deform while the labels it is pointing at stay readable.
     */
    return (
      <span className="game-ui-liquid-page__rail">
        <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
          <LiquidGroup.Item {...itemProps} radius={14} x={engaged ? SLOT : -SLOT}>
            <span style={{ width: SLOT, height: 34, display: 'block' }} />
          </LiquidGroup.Item>
        </LiquidGroup>
        <span aria-hidden="true" className="game-ui-liquid-page__rail-slots">
          <span data-on={engaged ? undefined : 'true'}>one</span>
          <span>two</span>
          <span data-on={engaged ? 'true' : undefined}>three</span>
        </span>
      </span>
    );
  }

  /*
   * bead: a scatter that can find itself.
   *
   * Engaged pulls the droplets in to a quarter of their spread rather than to
   * a single point. Stacked exactly on top of each other they fuse into one
   * smooth capsule, which is a pill — the one shape that says nothing about
   * having been made of droplets. Landing them close but not coincident is
   * what leaves the lumps, and the lumps are the whole sentence.
   */
  const beads = [
    [-46, -13],
    [-19, 11],
    [5, -15],
    [29, 9],
    [50, -7],
  ] as const;
  const GATHER = 0.24;
  return (
    <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
      {beads.map(([x, y], index) => (
        <LiquidGroup.Item
          {...itemProps}
          key={index}
          delay={index * 40}
          radius={999}
          x={engaged ? x * GATHER : x}
          y={engaged ? y * GATHER : y}
        >
          <span style={dot(22)} />
        </LiquidGroup.Item>
      ))}
    </LiquidGroup>
  );
}

function FormStage({
  form,
  engaged,
  fill,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill: string;
}): ReactNode {
  return LIQUID_FORMS[form].kind === 'body' ? (
    <BodyStage engaged={engaged} fill={fill} form={form} />
  ) : (
    <GroupStage engaged={engaged} fill={fill} form={form} />
  );
}

/*
 * The knobs, next to the thing they made.
 *
 * `contrast` gets a derived number beside it rather than only its own value,
 * because on its own it is the most misleading knob in the set: the alpha
 * crossing is pinned, so contrast is edge width in pixels and nothing else,
 * and reading "24" without reading "0.43px, raised to the 1.3px floor" is how
 * two rounds of edge tuning went into the wrong variable.
 */
/*
 * A shadow, as a person reads one.
 *
 * The literal value is `color-mix(in srgb, var(--token) 22%, transparent)` per
 * layer, which on a shelf of twelve tiles is a wall of CSS where a comparison
 * is supposed to be. What a reader is here to compare is how far the body sits
 * off the ground and how hard that contact is, so that is what this prints:
 * offset over blur, then strength.
 */
function readShadow(value: string | undefined): string | null {
  if (value === undefined) return null;
  return parseShadow(value)
    .map((layer) => {
      const strength = /(\d+(?:\.\d+)?)%/.exec(layer.color)?.[1];
      return `${layer.y}/${layer.blur}${strength === undefined ? '' : ` · ${strength}%`}`;
    })
    .join('  +  ');
}

function Knobs({ form, copy }: { form: LiquidForm; copy: Copy }): ReactNode {
  const finish = useContext(FinishContext);
  const { blur, contrast, blob, lobes, gloss, shadow, shadowEngaged } = LIQUID_FORMS[form].group;
  const effective = liquidGooeyEdgeContrast(blur, contrast);
  const edge = (2.5628 * blur) / effective;
  const rest = readShadow(shadow);
  const engagedShadow = readShadow(shadowEngaged);
  return (
    <dl className="game-ui-liquid-page__knobs">
      <dt>blur</dt>
      <dd>{blur}</dd>
      <dt>contrast</dt>
      <dd>
        {contrast}
        <span className="game-ui-liquid-page__derived">
          {' '}
          · {copy.edgeNote} {edge.toFixed(2)}px
          {effective < contrast ? ` → ${LIQUID_GOOEY_MIN_EDGE_RAMP}px` : ''}
        </span>
      </dd>
      <dt>blob</dt>
      <dd>
        {blob}
        {blob > 0 ? (
          <span className="game-ui-liquid-page__derived">
            {' '}
            · {lobes} {copy.lobesNote}
          </span>
        ) : null}
      </dd>
      <dt>gloss</dt>
      <dd>
        {liquidFinishGloss(finish, gloss)} · {finish}
      </dd>
      <dt>shadow</dt>
      <dd>
        {rest ?? copy.noShadow}
        {rest === null ? null : <span className="game-ui-liquid-page__derived"> · y/blur</span>}
      </dd>
      {engagedShadow === null ? null : (
        <>
          <dt>{copy.engagedKnob}</dt>
          <dd>{engagedShadow}</dd>
        </>
      )}
    </dl>
  );
}

function Shelf({
  kind,
  copy,
  tone,
}: {
  kind: 'body' | 'group';
  copy: Copy;
  tone: GameButtonVariant;
}): ReactNode {
  const [engaged, toggle] = useFormEngagement();
  const forms = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === kind);
  const [selected, setSelected] = useState<LiquidForm>(() => forms[0]!);
  return (
    <>
      <div
        className="game-ui-liquid-demo-controls"
        role="group"
        aria-label={kind === 'body' ? '单体形态' : '多体形态'}
      >
        {forms.map((form) => (
          <GameButton key={form} aria-pressed={selected === form} onClick={() => setSelected(form)}>
            {form}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__shelf">
        {forms
          .filter((form) => form === selected)
          .map((form) => {
            const on = engaged.has(form);
            return (
              <GamePanel className="game-ui-liquid-page__tile" key={form} tone="strong">
                <div className="game-ui-liquid-page__stage-slot">
                  <FormStage engaged={on} fill={TONE_FILL[tone]} form={form} />
                </div>
                <h4>{form}</h4>
                <p className="game-ui-liquid-page__prose">{LIQUID_FORMS[form].summary}</p>
                <GameButton onClick={() => toggle(form)} variant="ghost">
                  {form === 'ripple' ? copy.pulse : on ? copy.reset : copy.trigger}
                </GameButton>
                <Knobs copy={copy} form={form} />
              </GamePanel>
            );
          })}
      </div>
    </>
  );
}

/*
 * The clamp, shown rather than described.
 *
 * A form fixes one amplitude and then has to survive both of these. The number
 * under each body is what the pour actually came to after the clamp, which is
 * the whole argument for why a single `blob` value is safe to put in a bundle.
 */
function Sizes({ copy }: { copy: Copy }): ReactNode {
  const [engaged, toggle] = useFormEngagement();
  const bodies = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === 'body');
  const [selected, setSelected] = useState<LiquidForm>('press');
  const poured = (blob: number, shorter: number): string =>
    Math.min(blob, shorter * LIQUID_BLOB_MAX_FRACTION).toFixed(2);
  return (
    <>
      <div className="game-ui-liquid-demo-controls" role="group" aria-label="尺寸对照的形态">
        {bodies.map((form) => (
          <GameButton key={form} aria-pressed={selected === form} onClick={() => setSelected(form)}>
            {form}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__sizes">
        {bodies
          .filter((form) => form === selected)
          .map((form) => {
            const on = engaged.has(form);
            const { blob } = LIQUID_FORMS[form].group;
            return (
              <GamePanel className="game-ui-liquid-page__size-row" key={form} tone="strong">
                <header>
                  <h4>{form}</h4>
                  <GameButton onClick={() => toggle(form)} variant="ghost">
                    {form === 'ripple' ? copy.pulse : on ? copy.reset : copy.trigger}
                  </GameButton>
                </header>
                <div className="game-ui-liquid-page__size-pair">
                  <div>
                    <div className="game-ui-liquid-page__stage-slot">
                      <BodyStage engaged={on} form={form} />
                    </div>
                    <small>
                      {copy.control} · {copy.clamped} {poured(blob, 56)}px
                    </small>
                  </div>
                  <div>
                    <div className="game-ui-liquid-page__stage-slot game-ui-liquid-page__stage-slot--thin">
                      <BodyStage engaged={on} form={form} style={{ width: 200, height: 14 }} />
                    </div>
                    <small>
                      {copy.meter} · {copy.clamped} {poured(blob, 14)}px
                    </small>
                  </div>
                </div>
              </GamePanel>
            );
          })}
      </div>
    </>
  );
}

function Tones({ copy }: { copy: Copy }): ReactNode {
  const liquidFinish = useContext(FinishContext);
  const [selected, setSelected] = useState<GameButtonVariant>('primary');
  const [pressed, setPressed] = useState<GameButtonVariant | null>(null);
  return (
    <>
      <div className="game-ui-liquid-demo-controls" role="group" aria-label="颜色对照">
        {TONES.map((tone) => (
          <GameButton key={tone} aria-pressed={selected === tone} onClick={() => setSelected(tone)}>
            {tone}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__tones">
        {TONES.filter((tone) => tone === selected).map((tone) => (
          <GamePanel className="game-ui-liquid-page__tone" key={tone} tone="strong">
            <h4>{tone}</h4>
            <GameButton variant={tone}>{copy.flat}</GameButton>
            <span
              onPointerCancel={() => setPressed(null)}
              onPointerDown={() => setPressed(tone)}
              onPointerLeave={() => setPressed(null)}
              onPointerUp={() => setPressed(null)}
            >
              <GameButton surface="liquid" liquidFinish={liquidFinish} variant={tone}>
                {copy.liquid}
              </GameButton>
            </span>
            <small>{pressed === tone ? copy.engaged : copy.rest}</small>
          </GamePanel>
        ))}
      </div>
    </>
  );
}

/*
 * The liquid button, rendered the way `GameButton surface="liquid"` renders it,
 * with its press state pinned.
 *
 * The comparison only means something if both sides are the same control. An
 * unlabelled 132px body next to a 90px button is two different objects, and the
 * eye answers a question nobody asked. So this is the same composition
 * GameButton builds internally — the same classes, the same fill tokens, a real
 * <button> on top — held in whichever state the column is about.
 */
function LiquidButton({ label, active }: { label: string; active: boolean }): ReactNode {
  const liquidFinish = useContext(FinishContext);
  return (
    <LiquidSurface
      liquidFinish={liquidFinish}
      active={active}
      className="game-ui-button-liquid game-ui-button-liquid--primary"
      form="press"
    >
      <GameButton variant="primary">{label}</GameButton>
    </LiquidSurface>
  );
}

/*
 * Rest / engaged / disabled, with the flat control in the same row.
 *
 * The comparison is the content. Every judgement about whether the liquid body
 * carries enough weight was made next to this flat twin, because 「does it look
 * grounded」 has no answer on its own and a definite one against a control the
 * kit already got right.
 *
 * All three columns are pinned rather than interactive, and that is the point
 * of this section as opposed to the shelf above it: a state you have to hold a
 * finger on is a state you cannot compare against the one next to it. Pinning
 * the flat button's pressed look needs a preview-only class, because `:active`
 * is the only way the DOM will ever show it and the DOM will not hold it.
 */
function States({ copy }: { copy: Copy }): ReactNode {
  return (
    <div className="game-ui-liquid-page__states">
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.rest}</h4>
        <GameButton variant="primary">{copy.flat}</GameButton>
        <LiquidButton active={false} label={copy.liquid} />
      </GamePanel>
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.engaged}</h4>
        <span className="game-ui-liquid-page__pinned-press">
          <GameButton variant="primary">{copy.flat}</GameButton>
        </span>
        <LiquidButton active label={copy.liquid} />
      </GamePanel>
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.disabled}</h4>
        <GameButton disabled variant="primary">
          {copy.flat}
        </GameButton>
        <GameButton disabled surface="liquid" variant="primary">
          {copy.liquid}
        </GameButton>
        <small>{copy.disabledNote}</small>
      </GamePanel>
    </div>
  );
}

export function LiquidPreview(): ReactNode {
  const [lang, setLang] = useState<Lang>('zh-CN');
  const [finish, setFinish] = useState<LiquidFinish>('glossy');
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'shelf';
    return /liquid-(sizes|tones|states|knobs)-title/.exec(window.location.hash)?.[1] ?? 'shelf';
  });
  const [tone, setTone] = useState<GameButtonVariant>('primary');
  const copy = COPY[lang];

  useEffect(() => {
    document.documentElement.dataset.gameUiPreview = 'clay';
    return () => {
      delete document.documentElement.dataset.gameUiPreview;
    };
  }, []);

  return (
    <FinishContext.Provider value={finish}>
      <main
        aria-label="Swimmer UI Kit liquid surface"
        className="game-ui-preview game-ui-clay-preview game-ui-liquid-page"
      >
        <header className="game-ui-preview-hero">
          <GameBadge tone="ai">@pieai/swimmer-ui-kit</GameBadge>
          <GameLanguageMenu
            currentLabel={copy.triggerLabel}
            label={copy.langMenuLabel}
            onSelect={(id) => setLang(id as Lang)}
            options={[
              { id: 'en', label: 'English', meta: 'Page copy' },
              { id: 'zh-CN', label: '简体中文', meta: '页面文案' },
            ]}
            value={lang}
          />
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <p className="game-ui-liquid-page__rule">{copy.heroRule}</p>
          <p>
            <a href="/">先选成品控件：按钮、开关、进度、下拉 →</a>
          </p>
        </header>

        <section className="game-ui-preview-section" aria-label="材料实验选择">
          <p>
            这里展示的是动作形态，不是成品控件。只挂载当前实验，保留两组共享动效预算，不把其余示例静默降级。
          </p>
          <label>
            液体材质{' '}
            <select
              value={finish}
              onChange={(event) => setFinish(event.currentTarget.value as LiquidFinish)}
            >
              <option value="matte">哑光 · Matte</option>
              <option value="glossy">高光 · Glossy</option>
            </select>
          </label>
          <div className="game-ui-liquid-demo-controls" role="group" aria-label="材料实验类别">
            {(['shelf', 'sizes', 'tones', 'states', 'knobs'] as const).map((key) => (
              <GameButton
                key={key}
                aria-pressed={view === key}
                onClick={() => {
                  setView(key);
                  window.history.replaceState(null, '', `#liquid-${key}-title`);
                }}
              >
                {copy.sections[key]}
              </GameButton>
            ))}
          </div>
        </section>

        {view === 'shelf' && (
          <section aria-labelledby="liquid-shelf-title" className="game-ui-preview-section">
            <h2 id="liquid-shelf-title">{copy.sections.shelf}</h2>
            <p className="game-ui-liquid-page__prose">{copy.shelfBody}</p>
            <div
              className="game-ui-liquid-page__tone-picker"
              role="group"
              aria-label={copy.tonePicker}
            >
              <span>{copy.tonePicker}</span>
              {TONES.map((option) => (
                <GameButton
                  aria-pressed={tone === option}
                  key={option}
                  onClick={() => setTone(option)}
                  variant={tone === option ? option : 'ghost'}
                >
                  {option}
                </GameButton>
              ))}
            </div>
            <h3>
              {copy.bodies} <small className="game-ui-liquid-page__hint">{copy.bodiesHint}</small>
            </h3>
            <Shelf copy={copy} kind="body" tone={tone} />
            <h3>
              {copy.groups} <small className="game-ui-liquid-page__hint">{copy.groupsHint}</small>
            </h3>
            <Shelf copy={copy} kind="group" tone={tone} />
          </section>
        )}

        {view === 'sizes' && (
          <section aria-labelledby="liquid-sizes-title" className="game-ui-preview-section">
            <h2 id="liquid-sizes-title">{copy.sections.sizes}</h2>
            <p className="game-ui-liquid-page__prose">{copy.sizesBody}</p>
            <Sizes copy={copy} />
          </section>
        )}

        {view === 'tones' && (
          <section aria-labelledby="liquid-tones-title" className="game-ui-preview-section">
            <h2 id="liquid-tones-title">{copy.sections.tones}</h2>
            <p className="game-ui-liquid-page__prose">{copy.tonesBody}</p>
            <Tones copy={copy} />
          </section>
        )}

        {view === 'states' && (
          <section aria-labelledby="liquid-states-title" className="game-ui-preview-section">
            <h2 id="liquid-states-title">{copy.sections.states}</h2>
            <p className="game-ui-liquid-page__prose">{copy.statesBody}</p>
            <States copy={copy} />
          </section>
        )}

        {view === 'knobs' && (
          <section aria-labelledby="liquid-knobs-title" className="game-ui-preview-section">
            <h2 id="liquid-knobs-title">{copy.sections.knobs}</h2>
            <p className="game-ui-liquid-page__prose">{copy.knobsBody}</p>
            <dl className="game-ui-liquid-page__glossary">
              {copy.knobRows.map(([name, text]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
    </FinishContext.Provider>
  );
}
