export interface Shortcut {
  key: string
  action: string
  description: string
  displayValue: {
    mac: string
    other: string
  }
}

export const shortcuts: Shortcut[] = [
  {
    key: 'mod+O',
    action: 'open-files',
    description: 'Open Files',
    displayValue: { mac: 'Cmd+O', other: 'Ctrl+O' },
  },
  {
    key: 'mod+N',
    action: 'open-new-note',
    description: 'New Note',
    displayValue: { mac: 'Cmd+N', other: 'Ctrl+N' },
  },
  {
    key: 'mod+P',
    action: 'open-search',
    description: 'Semantic Search',
    displayValue: { mac: 'Cmd+P', other: 'Ctrl+P' },
  },
  {
    key: 'mod+T',
    action: 'open-chat-bot',
    description: 'Open Chatbot',
    displayValue: { mac: 'Cmd+T', other: 'Ctrl+T' },
  },
  {
    key: 'mod+D',
    action: 'open-new-directory-modal',
    description: 'New Directory',
    displayValue: { mac: 'Cmd+D', other: 'Ctrl+D' },
  },
  {
    key: 'mod+,',
    action: 'open-settings-modal',
    description: 'Settings',
    displayValue: { mac: 'Cmd+,', other: 'Ctrl+,' },
  },
]
