import { Editor } from '@tiptap/core'

function getMarkdown(editor: Editor) {
  // Fetch the current markdown content from the editor
  const originalMarkdown = editor.storage.markdown.getMarkdown()
  // Replace the escaped square brackets with unescaped ones
  const modifiedMarkdown = originalMarkdown
    .replace(/\\\[/g, '[') // Replaces \[ with [
    .replace(/\\\]/g, ']') // Replaces \] wi ]

  return modifiedMarkdown
}

export default getMarkdown
