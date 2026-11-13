import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DemoPanel,
  FlowStrip,
  ShowcaseShell,
  type ShowcaseLanguage,
  type ShowcaseTheme,
} from '../src/showcase';
import type { KitManifest } from '../src/showcase';
import '../src/showcase.css';
import kit from './kit.json';

function App() {
  const [theme, setTheme] = useState<ShowcaseTheme>('light');
  const [language, setLanguage] = useState<ShowcaseLanguage>('en');
  const zh = language === 'zh';
  const toggleTheme = () => setTheme((value) => (value === 'dark' ? 'light' : 'dark'));
  const toggleLanguage = () => setLanguage((value) => (value === 'en' ? 'zh' : 'en'));
  return (
    <ShowcaseShell
      kit={kit as KitManifest}
      theme={theme}
      language={language}
      onThemeChange={toggleTheme}
      onLanguageChange={toggleLanguage}
      demo={
        <DemoPanel
          label={zh ? '样式输入' : 'Style input'}
          initialValue="grey / light"
          placeholder="grey / light"
          runLabel={zh ? '运行样例' : 'Run sample'}
          resultLabel={zh ? '渲染结果' : 'Rendered output'}
          onRun={(value) => value + ' · ' + theme}
        >
          <FlowStrip
            steps={[
              { label: zh ? '选择' : 'Choose', detail: 'tokens' },
              { label: zh ? '组合' : 'Compose', detail: 'parts' },
              { label: zh ? '交付' : 'Ship', detail: 'page' },
            ]}
          />
        </DemoPanel>
      }
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
