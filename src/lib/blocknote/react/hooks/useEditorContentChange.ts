import { useEffect } from 'react'
import { BlockNoteEditor, BlockSchema } from '../../core'

function useEditorContentChange<BSchema extends BlockSchema>(editor: BlockNoteEditor<BSchema>, callback: () => void) {
  useEffect(() => {
    editor._tiptapEditor.on('update', callback)

    return () => {
      editor._tiptapEditor.off('update', callback)
    }
  }, [callback, editor._tiptapEditor])
}

export default useEditorContentChange
