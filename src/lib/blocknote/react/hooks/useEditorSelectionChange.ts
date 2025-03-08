import { useEffect } from 'react'
import { BlockNoteEditor, BlockSchema } from '../../core'

function useEditorSelectionChange<BSchema extends BlockSchema>(editor: BlockNoteEditor<BSchema>, callback: () => void) {
  useEffect(() => {
    editor._tiptapEditor.on('selectionUpdate', callback)

    return () => {
      editor._tiptapEditor.off('selectionUpdate', callback)
    }
  }, [callback, editor._tiptapEditor])
}

export default useEditorSelectionChange
