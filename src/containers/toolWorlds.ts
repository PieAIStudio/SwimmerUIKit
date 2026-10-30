export const TOOL_WORLDS = [
  'violet',
  'blue',
  'teal',
  'green',
  'coral',
  'orange',
  'indigo',
  'magenta',
] as const;

export type ToolWorld = (typeof TOOL_WORLDS)[number];
export type ToolSidebarMode = 'normal' | 'rail';
