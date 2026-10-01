import { type Lang, type Copy } from './copyTypes';

export const COPY: Readonly<Record<Lang, Copy>> = {
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
