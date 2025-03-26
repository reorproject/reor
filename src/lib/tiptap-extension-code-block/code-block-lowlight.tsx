/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-this-in-sfc */
import { NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import React, { FC } from 'react'
import styles from '../blocknote/core/extensions/Blocks/nodes/Block.module.css'
import { mergeCSSClasses } from '../blocknote'
import { CodeBlock, CodeBlockOptions } from './code-block'
import CodeBlockView from './code-block-view'
import LowlightPlugin from './lowlight-plugin'

export interface CodeBlockLowlightOptions extends CodeBlockOptions {
  lowlight: any
  defaultLanguage: string | null | undefined
}

export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: {},
      defaultLanguage: null,
    }
  },

  addNodeView() {
    const BlockContent: FC<NodeViewProps> = (props: NodeViewProps) => {
      const Content = CodeBlockView
      const blockContentDOMAttributes = this.options.domAttributes?.blockContent || {}
      const language = props.node.attrs.language
      return (
        <NodeViewWrapper
          {...Object.fromEntries(Object.entries(blockContentDOMAttributes).filter(([key]) => key !== 'class'))}
          className={mergeCSSClasses(
            styles.blockContent,
            blockContentDOMAttributes.class,
            language.length ? this.options.languageClassPrefix + language : '',
          )}
          data-content-type={props.node.type.name}
        >
          <Content
            props={props}
            languages={[...this.options.lowlight.listLanguages(), 'html'].sort((a, b) => a.localeCompare(b))}
          />
        </NodeViewWrapper>
      )
    }

    return ReactNodeViewRenderer(BlockContent, {
      className: styles.reactNodeViewRenderer,
    })
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      LowlightPlugin({
        name: this.name,
        lowlight: this.options.lowlight,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ]
  },
})
