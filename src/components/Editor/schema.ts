import { BlockSchema, TypesMatch, defaultProps } from '@/lib/blocknote'
import { defaultBlockSchema } from '@/lib/blocknote'
import CodeBlockLowlight from '@/lib/tiptap-extension-code-block'
import { common, createLowlight } from 'lowlight'
import { ImageBlock } from './types/Image/image'
import { VideoBlock } from './types/Video/video'

export const hmBlockSchema: BlockSchema = {
  paragraph: defaultBlockSchema.paragraph,
  heading: defaultBlockSchema.heading,
  // bulletListItem: defaultBlockSchema.bulletListItem,
  // numberedListItem: defaultBlockSchema.numberedListItem,
  image: ImageBlock,
  ['code-block']: {
    propSchema: {
      ...defaultProps,
      language: { default: '' },
    },
    // @ts-ignore
    node: CodeBlockLowlight.configure({
      defaultLanguage: 'plaintext',
      lowlight: createLowlight(common),
      languageClassPrefix: 'language-',
    }),
  },
  video: VideoBlock,
}

export type HMBlockSchema = TypesMatch<typeof hmBlockSchema>
