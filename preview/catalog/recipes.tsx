import { useState, type ReactNode } from 'react';
import {
  GameButton,
  GameIconButton,
  GameToggle,
  GameSegmentedControl,
  GameProgress,
  GameSelect,
  GameField,
  GameInput,
  GameTextArea,
  GameCheckbox,
  GameSlider,
  GameCallout,
  GameEmptyState,
  GameModal,
  type LiquidFinish,
  type GameButtonVariant,
} from '../../src/index';

/** Site and Storybook mount this same recipe. No second liquid renderer. */
export const CONTROL_RECIPES = [
  {
    id: 'button',
    title: '主按钮',
    api: 'GameButton',
    liquid: true,
    hint: '开始、继续或提交。只有液体外形变形，文字与点击区域保持稳定。',
  },
  {
    id: 'icon',
    title: '图标按钮',
    api: 'GameIconButton',
    liquid: true,
    hint: '紧凑操作也有可访问名称；按压反馈与主按钮共用同一实现。',
  },
  {
    id: 'toggle',
    title: '开关',
    api: 'GameToggle',
    liquid: true,
    hint: '开与关由滑块位置表达，不只靠颜色。点击或按空格切换。',
  },
  {
    id: 'segmented',
    title: '分段选择',
    api: 'GameSegmentedControl',
    liquid: true,
    hint: '少量并列选项。液体只跟随选中项，不改变文字位置。',
  },
  {
    id: 'progress',
    title: '进度条',
    api: 'GameProgress',
    liquid: true,
    hint: '拖动下方原生滑杆，观察液体前沿。进度数值有真实可访问语义。',
  },
  {
    id: 'select',
    title: '下拉选择',
    api: 'GameSelect',
    liquid: true,
    hint: '液体绘制关闭时的选择框；展开选项由系统原生菜单承接，不是自绘弹层。',
  },
  {
    id: 'input',
    title: '文本输入',
    api: 'GameField + GameInput',
    liquid: false,
    hint: '填写内容时保持安静；错误、必填、帮助文字与输入语义配套。',
  },
  {
    id: 'textarea',
    title: '多行文本',
    api: 'GameTextArea',
    liquid: false,
    hint: '真正的 DOM 输入框，保留中文输入、选择、复制与原生表单。',
  },
  {
    id: 'checkbox',
    title: '复选框',
    api: 'GameCheckbox',
    liquid: false,
    hint: '原生 checkbox；文字也是点击目标，不把一个装饰方块当成表单控件。',
  },
  {
    id: 'slider',
    title: '滑杆',
    api: 'GameSlider',
    liquid: false,
    hint: '原生 range 支持方向键与 step；这颗控件保持普通材质。',
  },
  {
    id: 'feedback',
    title: '反馈与空状态',
    api: 'GameCallout + GameEmptyState',
    liquid: false,
    hint: '清楚说明发生了什么以及下一步；不让整块说明文字持续流动。',
  },
  {
    id: 'modal',
    title: '模态对话框',
    api: 'GameModal',
    liquid: false,
    hint: '使用原生 dialog：阻断背景、Esc 关闭、焦点归还。不是一张覆盖全屏的普通卡片。',
  },
] as const;

export type RecipeId = (typeof CONTROL_RECIPES)[number]['id'];
export type RecipeMaterial = 'flat' | LiquidFinish;
export type RecipeState = 'ready' | 'disabled' | 'invalid';
export interface ControlRecipeProps {
  recipe: RecipeId;
  material?: RecipeMaterial;
  state?: RecipeState;
  tone?: GameButtonVariant;
}

export function ControlRecipe({
  recipe,
  material = 'glossy',
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
  const paint =
    material === 'flat'
      ? { surface: 'flat' as const }
      : { surface: 'liquid' as const, liquidFinish: material };
  switch (recipe) {
    case 'button':
      return (
        <div className="kit-recipe-stack">
          <GameButton
            {...paint}
            fullWidth
            variant={tone}
            disabled={disabled}
            onClick={() => setCount(count + 1)}
          >
            开始学习 · Start
          </GameButton>
          <output aria-live="polite">已触发 {count} 次</output>
        </div>
      );
    case 'icon':
      return (
        <div className="kit-recipe-stack">
          <GameIconButton
            {...paint}
            label="收藏这个示例"
            disabled={disabled}
            onClick={() => setCount(count + 1)}
          >
            <span aria-hidden="true">★</span>
          </GameIconButton>
          <output aria-live="polite">已收藏 {count} 次</output>
        </div>
      );
    case 'toggle':
      return (
        <div className="kit-recipe-stack">
          <GameToggle
            {...paint}
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
          <GameSegmentedControl
            {...paint}
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
          <GameProgress {...paint} value={value} label="课程完成进度" showValue />
          <GameSlider
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
          <GameField
            label="选择课程"
            required
            {...(invalid
              ? { error: '请选一门课程后继续。' }
              : { hint: '展开后是系统菜单，支持键盘选择。' })}
          >
            <GameSelect
              {...paint}
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
            </GameSelect>
          </GameField>
          <div className="kit-recipe-actions">
            <GameButton type="submit" disabled={disabled}>
              提交选择
            </GameButton>
            <GameButton type="reset" disabled={disabled}>
              重置
            </GameButton>
          </div>
          <output aria-live="polite">{submitted ? `已提交：${submitted}` : '尚未提交'}</output>
        </form>
      );
    case 'input':
      return (
        <GameField
          label="联系邮箱"
          {...(invalid
            ? { error: '请输入有效的邮箱地址。' }
            : { hint: '用于接收学习报告，不在示例中发送邮件。' })}
        >
          <GameInput
            type="email"
            name="email"
            placeholder="name@example.com"
            disabled={disabled}
            invalid={invalid}
            aria-invalid={invalid || undefined}
          />
        </GameField>
      );
    case 'textarea':
      return (
        <GameField label="学习笔记" hint="可以输入中文，也可以选择和复制。">
          <GameTextArea disabled={disabled} rows={4} placeholder="写下一点新的发现……" />
        </GameField>
      );
    case 'checkbox':
      return (
        <GameCheckbox
          label="保存我的阅读位置"
          checked={checked}
          disabled={disabled}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        />
      );
    case 'slider':
      return (
        <div className="kit-recipe-stack">
          <GameSlider
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
          <GameCallout heading="保存成功" tone="success">
            刚才的更改已经保存。这里没有后台请求。
          </GameCallout>
          <GameEmptyState
            title="这里还没有笔记"
            description="读完一段内容，再记录自己的理解。"
            action={
              <GameButton disabled={disabled} onClick={() => setCount(count + 1)}>
                新建笔记
              </GameButton>
            }
          />
          <output aria-live="polite">已新建 {count} 次</output>
        </div>
      );
    case 'modal':
      return (
        <>
          <GameButton disabled={disabled} onClick={() => setOpen(true)}>
            打开对话框
          </GameButton>
          <GameModal title="继续之前" closeLabel="关闭" open={open} onClose={() => setOpen(false)}>
            <p>这是原生模态框。试试 Tab、Escape 和关闭按钮。</p>
            <GameButton onClick={() => setOpen(false)}>确认并返回</GameButton>
          </GameModal>
        </>
      );
  }
}

/** Complete copyable examples, compiled by recipeCode.test.ts before release. */
export function recipeCode({
  recipe,
  material = 'glossy',
  state = 'ready',
  tone = 'primary',
}: ControlRecipeProps): string {
  const paint =
    material === 'flat' ? 'surface="flat"' : `surface="liquid" liquidFinish="${material}"`;
  const disabled = state === 'disabled' ? ' disabled' : '';
  const invalid = state === 'invalid' ? ' invalid aria-invalid="true"' : '';
  const bodies: Record<RecipeId, string> = {
    button: `const [count, setCount] = useState(0);\n  return <><GameButton ${paint} fullWidth variant="${tone}"${disabled} onClick={() => setCount(count + 1)}>开始学习</GameButton><output>{count}</output></>;`,
    icon: `const [count, setCount] = useState(0);\n  return <><GameIconButton ${paint} label="收藏"${disabled} onClick={() => setCount(count + 1)}><span aria-hidden="true">★</span></GameIconButton><output>{count}</output></>;`,
    toggle: `const [checked, setChecked] = useState(false);\n  return <GameToggle ${paint} label="学习提醒" checked={checked}${disabled} onClick={() => setChecked(!checked)} />;`,
    segmented: `const [activeId, setActiveId] = useState('notes');\n  return <GameSegmentedControl ${paint} label="学习内容" activeId={activeId}${disabled} onSelect={setActiveId} options={[{ id: 'lesson', label: '章节' }, { id: 'notes', label: '笔记' }, { id: 'practice', label: '练习' }]} />;`,
    progress: `const [value, setValue] = useState(40);\n  return <><GameProgress ${paint} label="课程完成进度" value={value} showValue /><GameSlider label="调整进度" min={0} max={100} step={5} value={value}${disabled} onChange={setValue} /></>;`,
    select: `const [course, setCourse] = useState('');\n  return <form onSubmit={(event) => { event.preventDefault(); console.log(course); }} onReset={() => setCourse('')}><GameField label="选择课程" required><GameSelect ${paint} name="course" value={course} onChange={(event) => setCourse(event.currentTarget.value)} required${disabled}${invalid}><option value="">请选择</option><optgroup label="基础课程"><option value="thinking">思考与表达</option><option value="code">编程入门</option></optgroup><option value="later" disabled>尚未开放</option></GameSelect></GameField><GameButton type="submit"${disabled}>提交选择</GameButton><GameButton type="reset"${disabled}>重置</GameButton></form>;`,
    input: `return <GameField label="联系邮箱" hint="用于接收学习报告。"><GameInput type="email" name="email" placeholder="name@example.com"${disabled}${invalid} /></GameField>;`,
    textarea: `return <GameField label="学习笔记"><GameTextArea rows={4} placeholder="写下新的发现……"${disabled} /></GameField>;`,
    checkbox: `const [checked, setChecked] = useState(false);\n  return <GameCheckbox label="保存阅读位置" checked={checked}${disabled} onChange={(event) => setChecked(event.currentTarget.checked)} />;`,
    slider: `const [value, setValue] = useState(40);\n  return <GameSlider label="音效音量" value={value} min={0} max={100} step={5}${disabled} onChange={setValue} />;`,
    feedback: `return <><GameCallout heading="保存成功" tone="success">更改已经保存。</GameCallout><GameEmptyState title="这里还没有笔记" description="记录自己的理解。" /></>;`,
    modal: `const [open, setOpen] = useState(false);\n  return <><GameButton onClick={() => setOpen(true)}${disabled}>打开对话框</GameButton><GameModal title="继续之前" closeLabel="关闭" open={open} onClose={() => setOpen(false)}><p>Tab 切换焦点，Escape 关闭。</p><GameButton onClick={() => setOpen(false)}>确认并返回</GameButton></GameModal></>;`,
  };
  const body = bodies[recipe]
    .replace('return ', 'return (\n    ')
    .replace(/;$/, '\n  );')
    .replace(/></g, '>\n    <');
  const names = [...new Set(body.match(/\bGame\w+/g))].sort();
  return `${body.includes('useState(') ? "import { useState } from 'react';\n" : ''}import { ${names.join(', ')} } from '@pieai/swimmer-ui-kit';\nimport '@pieai/swimmer-ui-kit/styles.css';\n\nexport function Example() {\n  ${body}\n}\n`;
}
