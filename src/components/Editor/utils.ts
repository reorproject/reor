import { Editor } from '@tiptap/core'
import { htmlToMd } from '@/utils/markdown'

export async function getMarkdown(editor: Editor) {
  const html = editor.getHTML()

  console.time('htmlToMd')
  const startTime = performance.now()

  const markdown = await htmlToMd(html)

  const endTime = performance.now()
  console.timeEnd('htmlToMd')
  console.log(`htmlToMd operation took ${endTime - startTime} milliseconds`)

  return markdown
}

export default getMarkdown
