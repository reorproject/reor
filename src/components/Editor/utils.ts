import { Editor } from '@tiptap/core'

export async function getMarkdown(editor: Editor) {
  const originalMarkdown = editor.storage.markdown.getMarkdown()
  // console.log('CALLING THIS')
  console.log('editor.state.doc', editor.state.doc)
  // console.log('editor.storage.markdown', editor.storage.markdown)
  // const originalMarkdown = editor.storage.markdown.serializer.serialize(editor.state.doc)
  // const html = editor.getHTML()

  // console.time('htmlToMd')
  // const startTime = performance.now()

  // const markdown = await htmlToMd(html)

  // const endTime = performance.now()
  // console.timeEnd('htmlToMd')
  // console.log(`htmlToMd operation took ${endTime - startTime} milliseconds`)

  return originalMarkdown
}

export default getMarkdown
