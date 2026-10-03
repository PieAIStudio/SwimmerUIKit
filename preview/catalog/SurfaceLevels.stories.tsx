import type { Meta, StoryObj } from '@storybook/react-vite';
import { SurfaceLevels } from './SurfaceLevels';
const meta = { title: 'Swimmer/Theme/SurfaceLevels', component: SurfaceLevels } satisfies Meta<
  typeof SurfaceLevels
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = {
  render: () => (
    <div data-game-ui-theme="light">
      <SurfaceLevels />
    </div>
  ),
};
export const Dark: Story = {
  render: () => (
    <div data-game-ui-theme="dark">
      <SurfaceLevels />
    </div>
  ),
};
