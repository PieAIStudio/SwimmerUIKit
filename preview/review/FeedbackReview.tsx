import { useState } from 'react';
import {
  Badge,
  Button,
  Callout,
  Icon,
  IconButton,
  Progress,
  Toast,
  Tooltip,
} from '../../src/index';
import { GAME_UI_STYLES, type UiStyle } from '../../src/tokens/styles';
import './feedback-review.css';

/** Actual display components, with no duplicate paint in the review harness. */
export function FeedbackReview() {
  const query = new URLSearchParams(window.location.search);
  const style = GAME_UI_STYLES.find((value) => value === query.get('style')) ?? 'pastel';
  const [uiStyle, setStyle] = useState<UiStyle>(style);
  const [theme, setTheme] = useState(query.get('theme') === 'dark' ? 'dark' : 'light');
  const [value, setValue] = useState(0);
  return (
    <main className="feedback-review" data-game-ui-style={uiStyle} data-game-ui-theme={theme}>
      <header>
        <h1>看得明白，不必一直动。</h1>
        <label>
          风格
          <select value={uiStyle} onChange={(event) => setStyle(event.target.value as UiStyle)}>
            {GAME_UI_STYLES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          明暗
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
      </header>
      <section aria-label="静止展示组件">
        <h2>静止的水滴</h2>
        <div className="feedback-review-row" data-display-badges>
          <Badge>普通</Badge>
          <Badge tone="success">已完成</Badge>
          <Badge tone="warning">待确认</Badge>
          <Badge tone="danger">需留意</Badge>
          <Badge tone="ai">协作中</Badge>
        </div>
        <div className="feedback-review-grid">
          <Callout heading="留在原处" tone="neutral">
            说明和内容安静地摆在这里。
          </Callout>
          <Callout heading="提示" tone="info">
            一个新发现，等你来看。
          </Callout>
          <Callout heading="已保存" tone="success">
            这是宿主确认后的真实状态。
          </Callout>
          <Callout heading="检查一下" tone="warning">
            重要信息不藏在悬停提示里。
          </Callout>
          <Callout heading="操作失败" tone="danger">
            没有自动重试，也没有删除内容。
          </Callout>
        </div>
        <div className="feedback-review-grid">
          <Toast>有新内容</Toast>
          <Toast tone="success">保存完成</Toast>
          <Toast tone="danger">请检查输入</Toast>
        </div>
        <div className="feedback-review-tooltip">
          <Tooltip label="这是可省略的补充说明">
            <IconButton label="补充说明">
              <Icon icon="alert" />
            </IconButton>
          </Tooltip>
        </div>
      </section>
      <section aria-label="液体进度">
        <h2>前进时轻轻晃一下</h2>
        <Progress value={value} showValue label="完成进度" />
        <div className="feedback-review-row">
          <Button onClick={() => setValue(0)}>归零</Button>
          <Button onClick={() => setValue(65)}>前进到65</Button>
          <Button onClick={() => setValue(100)}>完成至100</Button>
        </div>
        <p>只表示真实数值。停止变化后没有待机动画。</p>
      </section>
    </main>
  );
}
