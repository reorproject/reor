import React, { useState } from 'react'
import { YStack } from 'tamagui'
import { EmbedComponent } from '../ui/src'
import { NodeSelection, TextSelection } from 'prosemirror-state'
import { Block, BlockNoteEditor, useEditorSelectionChange } from '@/lib/blocknote'
import MultipleNodeSelection from '@/lib/blocknote/core/extensions/DraggableBlocks/MultipleNodeSelection'
import type { HMBlockSchema } from '../schema'
import { getNodesInSelection } from './utils'
import mediaConfig from '@/components/Editor/ui/src/tamagui/config/mediaEmbed'

export type MediaType = {
  id: string
  props: {
    url: string
    name: string
    size?: string
    view?: 'Content' | 'Card'
    width?: string
  }
  children: []
  content: []
  type: string
}

export interface DisplayComponentProps {
  editor: BlockNoteEditor<HMBlockSchema>
  block: Block<HMBlockSchema>
  selected: boolean
  setSelected: any
  assign?: any
}

interface RenderProps {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
  mediaType: keyof typeof mediaConfig
  submit?: (
    assignMedia: (props: MediaType) => void,
    queryType: string,
    url?: string,
    setFileName?: any,
  ) => Promise<void>
  DisplayComponent: React.ComponentType<DisplayComponentProps>
  hideForm?: boolean
}

interface MediaComponentProps {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
  assign: any
  selected: boolean
  setSelected: any
  DisplayComponent: React.ComponentType<DisplayComponentProps>
}

const MediaComponent: React.FC<MediaComponentProps> = ({
  block,
  editor,
  assign,
  selected,
  setSelected,
  DisplayComponent,
}) => {
  return (
    <DisplayComponent editor={editor} block={block} selected={selected} setSelected={setSelected} assign={assign} />
  )
}

export function updateSelection(
  editor: BlockNoteEditor<HMBlockSchema>,
  block: Block<HMBlockSchema>,
  setSelected: (selected: boolean) => void,
) {
  const { view } = editor._tiptapEditor
  const { selection } = view.state
  let isSelected = false

  if (selection instanceof NodeSelection) {
    // If the selection is a NodeSelection, check if this block is the selected node
    const selectedNode = view.state.doc.resolve(selection.from).parent
    if (selectedNode && selectedNode.attrs && selectedNode.attrs.id === block.id) {
      isSelected = true
    }
  } else if (selection instanceof TextSelection || selection instanceof MultipleNodeSelection) {
    // If it's a TextSelection or MultipleNodeSelection (TODO Fix for drag), check if this block's node is within the selection range
    const selectedNodes = getNodesInSelection(view)
    isSelected = selectedNodes.some((node) => node.attrs && node.attrs.id === block.id)
  }

  setSelected(isSelected)
}

export const MediaRender: React.FC<RenderProps> = ({
  block,
  editor,
  mediaType,
  submit,
  DisplayComponent,
  hideForm,
}) => {
  const [selected, setSelected] = useState(false)
  useEditorSelectionChange(editor, () => updateSelection(editor, block, setSelected))

  const assignMedia = (props: MediaType) => {
    editor.updateBlock(block.id, props)
  }
  return (
    <YStack>
      {hideForm ? (
        <MediaComponent
          block={block}
          editor={editor}
          assign={assignMedia}
          selected={selected}
          setSelected={setSelected}
          DisplayComponent={DisplayComponent}
        />
      ) : (
        <EmbedComponent props={mediaConfig[mediaType]} submit={submit} assign={assignMedia} />
      )}
    </YStack>
  )
}
