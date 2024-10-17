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
    key: 'CommandOrControl+O',
    action: 'open-files',
    description: 'Open Files',
    displayValue: { mac: 'Cmd+O', other: 'Ctrl+O' },
  },
  {
    key: 'CommandOrControl+N',
    action: 'open-new-note',
    description: 'New Note',
    displayValue: { mac: 'Cmd+N', other: 'Ctrl+N' },
  },
  {
    key: 'CommandOrControl+P',
    action: 'open-search',
    description: 'Semantic Search',
    displayValue: { mac: 'Cmd+P', other: 'Ctrl+P' },
  },
  {
    key: 'CommandOrControl+T',
    action: 'open-chat-bot',
    description: 'Open Chatbot',
    displayValue: { mac: 'Cmd+T', other: 'Ctrl+T' },
  },
  {
    key: 'CommandOrControl+D',
    action: 'open-new-directory-modal',
    description: 'New Directory',
    displayValue: { mac: 'Cmd+D', other: 'Ctrl+D' },
  },
  {
    key: 'CommandOrControl+Q',
    action: 'open-flashcard-quiz-modal',
    description: 'Flashcard quiz',
    displayValue: { mac: 'Cmd+Q', other: 'Ctrl+Q' },
  },
  {
    key: 'CommandOrControl+,',
    action: 'open-settings-modal',
    description: 'Settings',
    displayValue: { mac: 'Cmd+,', other: 'Ctrl+,' },
  },
]
