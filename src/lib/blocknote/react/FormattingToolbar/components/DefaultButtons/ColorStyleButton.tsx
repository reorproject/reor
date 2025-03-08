import { Menu } from '@mantine/core'
import React, { useCallback, useState } from 'react'
import { BlockNoteEditor, BlockSchema } from '@/lib/blocknote/core'
import ColorIcon from '../../../SharedComponents/ColorPicker/components/ColorIcon'
import ColorPicker from '../../../SharedComponents/ColorPicker/components/ColorPicker'
import { ToolbarButton } from '../../../SharedComponents/Toolbar/components/ToolbarButton'
import useEditorContentChange from '../../../hooks/useEditorContentChange'
import useEditorSelectionChange from '../../../hooks/useEditorSelectionChange'

const createColorIcon = (currentTextColor?: string | undefined, currentBackgroundColor?: string | undefined) => {
  return <ColorIcon textColor={currentTextColor} backgroundColor={currentBackgroundColor} size={20} />
}

const ColorStyleButton = <BSchema extends BlockSchema>(props: { editor: BlockNoteEditor<BSchema> }) => {
  const [currentTextColor, setCurrentTextColor] = useState<string>(
    props.editor.getActiveStyles().textColor || 'default',
  )
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>(
    props.editor.getActiveStyles().backgroundColor || 'default',
  )

  useEditorContentChange(props.editor, () => {
    setCurrentTextColor(props.editor.getActiveStyles().textColor || 'default')
    setCurrentBackgroundColor(props.editor.getActiveStyles().backgroundColor || 'default')
  })

  useEditorSelectionChange(props.editor, () => {
    setCurrentTextColor(props.editor.getActiveStyles().textColor || 'default')
    setCurrentBackgroundColor(props.editor.getActiveStyles().backgroundColor || 'default')
  })

  const setTextColor = useCallback(
    (color: string) => {
      props.editor.focus()
      if (color === 'default') {
        props.editor.removeStyles({ textColor: color })
      } else {
        props.editor.addStyles({ textColor: color })
      }
    },
    [props.editor],
  )

  const setBackgroundColor = useCallback(
    (color: string) => {
      props.editor.focus()
      if (color === 'default') {
        props.editor.removeStyles({ backgroundColor: color })
      } else {
        props.editor.addStyles({ backgroundColor: color })
      }
    },
    [props.editor],
  )

  const ColorIconComponent = createColorIcon(currentTextColor, currentBackgroundColor)

  return (
    <Menu>
      <Menu.Target>
        <ToolbarButton mainTooltip="Colors" icon={() => ColorIconComponent} />
      </Menu.Target>
      <Menu.Dropdown>
        <ColorPicker
          textColor={currentTextColor}
          setTextColor={setTextColor}
          backgroundColor={currentBackgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColorStyleButton
