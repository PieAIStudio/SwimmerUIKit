import { useState, type ReactNode } from 'react';
import {
  Button,
  IconButton,
  Toggle,
  SegmentedControl,
  Progress,
  Select,
  Field,
  Input,
  TextArea,
  Checkbox,
  Slider,
  Callout,
  EmptyState,
  Modal,
  type UiStyle,
  type ButtonVariant,
} from '../../src/index';

/** Site and Storybook mount this same recipe. No second liquid renderer. */
export const CONTROL_RECIPES = [
  {
    id: 'button',
    title: '主按钮',
    api: 'Button',
    liquid: true,
    hint: '开始、继续或提交。只有液体外形变形，文字与点击区域保持稳定。',
  },
  {
    id: 'icon',
    title: '图标按钮',
    api: 'IconButton',
    liquid: false,
    hint: '紧凑操作也有可访问名称；二维水滴背景变形，原生点击区域保持稳定。',
  },
  {
    id: 'toggle',
    title: '开关',
    api: 'Toggle',
    liquid: false,
    hint: '开与关由滑块位置表达，不只靠颜色。点击或按空格切换。',
  },
  {
    id: 'segmented',
    title: '分段选择',
    api: 'SegmentedControl',
    liquid: false,
    hint: '少量并列选项；选中增加对勾，不放大、不推动相邻选项。',
  },
  {
    id: 'progress',
    title: '进度条',
    api: 'Progress',
    liquid: false,
    hint: '拖动下方原生滑杆，查看真实完成比例；进度不是液体主操作。',
  },
  {
    id: 'select',
    title: '下拉选择',
    api: 'Select',
    liquid: false,
    hint: '平面输入框只换边和底色；选项由系统菜单承接，不做自绘弹层。',
  },
  {
    id: 'input',
    title: '文本输入',
    api: 'Field + Input',
    liquid: false,
    hint: '填写内容时保持安静；错误、必填、帮助文字与输入语义配套。',
  },
  {
    id: 'textarea',
    title: '多行文本',
    api: 'TextArea',
    liquid: false,
    hint: '真正的 DOM 输入框，保留中文输入、选择、复制与原生表单。',
  },
  {
    id: 'checkbox',
    title: '复选框',
    api: 'Checkbox',
    liquid: false,
    hint: '原生 checkbox；文字也是点击目标，不把一个装饰方块当成表单控件。',
  },
  {
    id: 'slider',
    title: '滑杆',
    api: 'Slider',
    liquid: false,
    hint: '原生 range 支持方向键与 step；这颗控件保持普通材质。',
  },
  {
    id: 'feedback',
    title: '反馈与空状态',
    api: 'Callout + EmptyState',
    liquid: false,
    hint: '清楚说明发生了什么以及下一步；不让整块说明文字持续流动。',
  },
  {
    id: 'modal',
    title: '模态对话框',
    api: 'Modal',
    liquid: false,
    hint: '使用原生 dialog：阻断背景、Esc 关闭、焦点归还。不是一张覆盖全屏的普通卡片。',
  },
] as const;

export type RecipeId = (typeof CONTROL_RECIPES)[number]['id'];
export type RecipeStyle = UiStyle;
export type RecipeState = 'ready' | 'disabled' | 'invalid';
export interface ControlRecipeProps {
  recipe: RecipeId;
  uiStyle?: RecipeStyle;
  state?: RecipeState;
  tone?: ButtonVariant;
}

export function ControlRecipe({ uiStyle = 'pastel', ...props }: ControlRecipeProps): ReactNode {
  return (
    <div data-game-ui-style={uiStyle}>
      <RecipeContent {...props} />
    </div>
  );
}

function RecipeContent({
  recipe,
  state = 'ready',
  tone = 'primary',
}: ControlRecipeProps): ReactNode {
  const [count, setCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState('notes');
  const [value, setValue] = useState(40);
  const [course, setCourse] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [open, setOpen] = useState(false);
  const disabled = state === 'disabled';
  const invalid = state === 'invalid';
  switch (recipe) {
    case 'button':
      return (
        <div className="kit-recipe-stack">
          <Button fullWidth variant={tone} disabled={disabled} onClick={() => setCount(count + 1)}>
            开始学习 · Start
          </Button>
          <output aria-live="polite">已触发 {count} 次</output>
        </div>
      );
    case 'icon':
      return (
        <div className="kit-recipe-stack">
          <IconButton label="收藏这个示例" disabled={disabled} onClick={() => setCount(count + 1)}>
            <span aria-hidden="true">★</span>
          </IconButton>
          <output aria-live="polite">已收藏 {count} 次</output>
        </div>
      );
    case 'toggle':
      return (
        <div className="kit-recipe-stack">
          <Toggle
            checked={checked}
            label="学习提醒"
            disabled={disabled}
            onClick={() => setChecked(!checked)}
          />
          <output aria-live="polite">{checked ? '提醒已开启' : '提醒已关闭'}</output>
        </div>
      );
    case 'segmented':
      return (
        <div className="kit-recipe-stack">
          <SegmentedControl
            disabled={disabled}
            activeId={selected}
            label="学习内容"
            options={[
              { id: 'lesson', label: '章节' },
              { id: 'notes', label: '笔记' },
              { id: 'practice', label: '练习' },
            ]}
            onSelect={setSelected}
          />
          <output aria-live="polite">当前：{selected}</output>
        </div>
      );
    case 'progress':
      return (
        <div className="kit-recipe-stack">
          <Progress value={value} label="课程完成进度" showValue />
          <Slider
            label="调整进度"
            min={0}
            max={100}
            step={5}
            value={value}
            disabled={disabled}
            onChange={setValue}
          />
        </div>
      );
    case 'select':
      return (
        <form
          className="kit-recipe-stack"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(course);
          }}
          onReset={() => {
            setCourse('');
            setSubmitted('');
          }}
        >
          <Field
            label="选择课程"
            required
            {...(invalid
              ? { error: '请选一门课程后继续。' }
              : { hint: '展开后是系统菜单，支持键盘选择。' })}
          >
            <Select
              name="course"
              value={course}
              onChange={(event) => setCourse(event.currentTarget.value)}
              required
              invalid={invalid}
              disabled={disabled}
            >
              <option value="">请选择</option>
              <optgroup label="基础课程">
                <option value="thinking">思考与表达</option>
                <option value="code">编程入门</option>
              </optgroup>
              <option value="later" disabled>
                进阶课程 · 尚未开放
              </option>
            </Select>
          </Field>
          <div className="kit-recipe-actions">
            <Button type="submit" disabled={disabled}>
              提交选择
            </Button>
            <Button type="reset" disabled={disabled}>
              重置
            </Button>
          </div>
          <output aria-live="polite">{submitted ? `已提交：${submitted}` : '尚未提交'}</output>
        </form>
      );
    case 'input':
      return (
        <Field
          label="联系邮箱"
          {...(invalid
            ? { error: '请输入有效的邮箱地址。' }
            : { hint: '用于接收学习报告，不在示例中发送邮件。' })}
        >
          <Input
            type="email"
            name="email"
            placeholder="name@example.com"
            disabled={disabled}
            invalid={invalid}
            aria-invalid={invalid || undefined}
          />
        </Field>
      );
    case 'textarea':
      return (
        <Field label="学习笔记" hint="可以输入中文，也可以选择和复制。">
          <TextArea disabled={disabled} rows={4} placeholder="写下一点新的发现……" />
        </Field>
      );
    case 'checkbox':
      return (
        <Checkbox
          label="保存我的阅读位置"
          checked={checked}
          disabled={disabled}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        />
      );
    case 'slider':
      return (
        <div className="kit-recipe-stack">
          <Slider
            label="音效音量"
            value={value}
            min={0}
            max={100}
            step={5}
            disabled={disabled}
            onChange={setValue}
          />
          <output>{value}%</output>
        </div>
      );
    case 'feedback':
      return (
        <div className="kit-recipe-stack">
          <Callout heading="保存成功" tone="success">
            刚才的更改已经保存。这里没有后台请求。
          </Callout>
          <EmptyState
            title="这里还没有笔记"
            description="读完一段内容，再记录自己的理解。"
            action={
              <Button disabled={disabled} onClick={() => setCount(count + 1)}>
                新建笔记
              </Button>
            }
          />
          <output aria-live="polite">已新建 {count} 次</output>
        </div>
      );
    case 'modal':
      return (
        <>
          <Button disabled={disabled} onClick={() => setOpen(true)}>
            打开对话框
          </Button>
          <Modal title="继续之前" closeLabel="关闭" open={open} onClose={() => setOpen(false)}>
            <p>这是原生模态框。试试 Tab、Escape 和关闭按钮。</p>
            <Button onClick={() => setOpen(false)}>确认并返回</Button>
          </Modal>
        </>
      );
  }
}

/** Complete copyable examples, compiled by recipeCode.test.ts before release. */
export function recipeCode({
  recipe,
  uiStyle = 'pastel',
  state = 'ready',
  tone = 'primary',
}: ControlRecipeProps): string {
  const disabled = state === 'disabled' ? ' disabled' : '';
  const invalid = state === 'invalid' ? ' invalid aria-invalid="true"' : '';
  const bodies: Record<RecipeId, string> = {
    button: `const [count, setCount] = useState(0);\n  return <><Button fullWidth variant="${tone}"${disabled} onClick={() => setCount(count + 1)}>开始学习</Button><output>{count}</output></>;`,
    icon: `const [count, setCount] = useState(0);\n  return <><IconButton label="收藏"${disabled} onClick={() => setCount(count + 1)}><span aria-hidden="true">★</span></IconButton><output>{count}</output></>;`,
    toggle: `const [checked, setChecked] = useState(false);\n  return <Toggle label="学习提醒" checked={checked}${disabled} onClick={() => setChecked(!checked)} />;`,
    segmented: `const [activeId, setActiveId] = useState('notes');\n  return <SegmentedControl label="学习内容" activeId={activeId}${disabled} onSelect={setActiveId} options={[{ id: 'lesson', label: '章节' }, { id: 'notes', label: '笔记' }, { id: 'practice', label: '练习' }]} />;`,
    progress: `const [value, setValue] = useState(40);\n  return <><Progress label="课程完成进度" value={value} showValue /><Slider label="调整进度" min={0} max={100} step={5} value={value}${disabled} onChange={setValue} /></>;`,
    select: `const [course, setCourse] = useState('');\n  return <form onSubmit={(event) => { event.preventDefault(); console.log(course); }} onReset={() => setCourse('')}><Field label="选择课程" required><Select name="course" value={course} onChange={(event) => setCourse(event.currentTarget.value)} required${disabled}${invalid}><option value="">请选择</option><optgroup label="基础课程"><option value="thinking">思考与表达</option><option value="code">编程入门</option></optgroup><option value="later" disabled>尚未开放</option></Select></Field><Button type="submit"${disabled}>提交选择</Button><Button type="reset"${disabled}>重置</Button></form>;`,
    input: `return <Field label="联系邮箱" hint="用于接收学习报告。"><Input type="email" name="email" placeholder="name@example.com"${disabled}${invalid} /></Field>;`,
    textarea: `return <Field label="学习笔记"><TextArea rows={4} placeholder="写下新的发现……"${disabled} /></Field>;`,
    checkbox: `const [checked, setChecked] = useState(false);\n  return <Checkbox label="保存阅读位置" checked={checked}${disabled} onChange={(event) => setChecked(event.currentTarget.checked)} />;`,
    slider: `const [value, setValue] = useState(40);\n  return <Slider label="音效音量" value={value} min={0} max={100} step={5}${disabled} onChange={setValue} />;`,
    feedback: `return <><Callout heading="保存成功" tone="success">更改已经保存。</Callout><EmptyState title="这里还没有笔记" description="记录自己的理解。" /></>;`,
    modal: `const [open, setOpen] = useState(false);\n  return <><Button onClick={() => setOpen(true)}${disabled}>打开对话框</Button><Modal title="继续之前" closeLabel="关闭" open={open} onClose={() => setOpen(false)}><p>Tab 切换焦点，Escape 关闭。</p><Button onClick={() => setOpen(false)}>确认并返回</Button></Modal></>;`,
  };
  const body = bodies[recipe]
    .replace('return ', `return (\n    <div data-game-ui-style="${uiStyle}">`)
    .replace(/;$/, '</div>\n  );')
    .replace(/></g, '>\n    <');
  const names = [
    ...new Set(
      body.match(
        /\b(?:Button|IconButton|Toggle|SegmentedControl|Progress|Slider|Select|Field|Input|TextArea|Checkbox|Callout|EmptyState|Modal)\b/g,
      ) ?? [],
    ),
  ].sort();
  return `${body.includes('useState(') ? "import { useState } from 'react';\n" : ''}import { ${names.join(', ')} } from '@pieai/swimmer-ui-kit';\nimport '@pieai/swimmer-ui-kit/styles.css';\n\nexport function Example() {\n  ${body}\n}\n`;
}
