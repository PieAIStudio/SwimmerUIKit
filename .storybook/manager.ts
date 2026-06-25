import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Clicking the sidebar brand title jumps back to the visual showcase at "/",
// completing the two-way switch between the showcase and Storybook.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '← Swimmer UI Kit · 组件总览',
    brandUrl: 'https://swimmer-ui-kit.pieaistudio.com/',
    brandTarget: '_self',
  }),
});
