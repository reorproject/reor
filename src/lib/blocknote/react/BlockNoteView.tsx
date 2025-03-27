import { MantineProvider } from '@mantine/core'
import { createStyles } from '@mantine/styles'
import { EditorContent } from '@tiptap/react'
import React, { HTMLAttributes, ReactNode, useMemo } from 'react'
import { usePrefersColorScheme } from 'use-prefers-color-scheme'
import { BlockNoteEditor, BlockSchema, mergeCSSClasses } from '../core'
import { Theme, blockNoteToMantineTheme } from './BlockNoteTheme'
import { darkDefaultTheme, lightDefaultTheme } from './defaultThemes'

// Renders the editor as well as all menus & toolbars using default styles.
const BaseBlockNoteView = <BSchema extends BlockSchema>(
  props: {
    editor: BlockNoteEditor<BSchema>
    children?: ReactNode
  } & HTMLAttributes<HTMLDivElement>,
) => {
  const { classes } = createStyles({ root: {} })(undefined, {
    name: 'Editor',
  })

  const { editor, children, className, ...rest } = props

  return (
    <EditorContent
      editor={props.editor?._tiptapEditor || null}
      className={mergeCSSClasses(classes.root, props.className || '')}
      {...rest}
    >
      {props.children}
    </EditorContent>
  )
}

// eslint-disable-next-line import/prefer-default-export
export const BlockNoteView = <BSchema extends BlockSchema>(
  props: {
    editor: BlockNoteEditor<BSchema>
    theme?:
      | 'light'
      | 'dark'
      | Theme
      | {
          light: Theme
          dark: Theme
        }
    children?: ReactNode
  } & HTMLAttributes<HTMLDivElement>,
) => {
  const { theme = { light: lightDefaultTheme, dark: darkDefaultTheme }, ...rest } = props

  const preferredTheme = usePrefersColorScheme()

  const mantineTheme = useMemo(() => {
    if (theme === 'light') {
      return blockNoteToMantineTheme(lightDefaultTheme)
    }

    if (theme === 'dark') {
      return blockNoteToMantineTheme(darkDefaultTheme)
    }

    if ('light' in theme && 'dark' in theme) {
      return blockNoteToMantineTheme(theme[preferredTheme === 'dark' ? 'dark' : 'light'])
    }

    return blockNoteToMantineTheme(theme)
  }, [preferredTheme, theme])

  return (
    <MantineProvider theme={mantineTheme}>
      <BaseBlockNoteView {...rest} />
    </MantineProvider>
  )
}
