import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpLoop } from './HelpLoop';
import './wifi.stories.css';

/** Original concept drawing, shared only by stories; never a product asset. */
export function WifiDrawing({ step = 0 }: { step?: number }) {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true" focusable="false">
      <g className={step === 1 ? 'help-wifi-approach-left' : undefined}>
        <rect x="38" y="70" width="100" height="65" rx="7" />
        <path d="M29 143h118l-9 7H38zM47 79h82v46H47z" />
      </g>
      <g className={step === 1 ? 'help-wifi-approach-right' : undefined}>
        <rect x="220" y="67" width="47" height="83" rx="8" />
        <path d="M235 75h17M240 141h7" />
      </g>
      <g className="help-wifi-signal">
        <path d="M133 37q27-24 54 0M142 47q18-16 36 0M151 57q9-8 18 0" />
        <circle cx="160" cy="65" r="2" />
      </g>
      <path className="help-wifi-link" d="M147 100h26q9 0 9-9V75M191 100h20" />
      {step === 2 && <path className="help-wifi-confirm" d="m73 101 9 9 19-21m133 20 7 7 13-16" />}
    </svg>
  );
}

const meta = {
  title: 'Feedback/HelpLoop',
  component: HelpLoop,
  args: { children: <WifiDrawing />, poster: <WifiDrawing step={2} /> },
  excludeStories: ['WifiDrawing'],
} satisfies Meta<typeof HelpLoop>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SameWifi: Story = {
  render: () => (
    <figure
      style={{ width: 'min(100%, 320px)', margin: 0 }}
      role="img"
      aria-label="Join the same Wi-Fi on both devices."
    >
      <HelpLoop poster={<WifiDrawing step={2} />}>
        <WifiDrawing />
      </HelpLoop>
      <figcaption aria-hidden="true">Join the same Wi-Fi on both devices.</figcaption>
    </figure>
  ),
};
