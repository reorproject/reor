/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { NodeViewProps } from '@tiptap/core'
import { NodeViewContent } from '@tiptap/react'
import { Popover, Button, SizableText, ScrollView } from 'tamagui'
import { ChevronDown } from '@tamagui/lucide-icons'
import { XStack, YStack } from '@/components/Editor/ui/src'

const languages = [
  'Arduino',
  'Bash',
  'C',
  'CPP',
  'Csharp',
  'Css',
  'Diff',
  'Go',
  'Graphql',
  'Ini',
  'Java',
  'javascript',
  'Json',
  'Kotlin',
  'Less',
  'Lua',
  'Makefile',
  'Markdown',
  'Objectivec',
  'Perl',
  'Php',
  'Php-template',
  'Plaintext',
  'Python',
  'Python-repl',
  'R',
  'Ruby',
  'Rust',
  'Scss',
  'Shell',
  'Sql',
  'Swift',
  'Typescript',
  'Vbnet',
  'Wasm',
  'XML',
  'YAML',
]

const CodeBlockView = ({ props }: { props: NodeViewProps }) => {
  const { node, updateAttributes } = props
  const [hovered, setHovered] = useState(false)
  const [language, setLanguage] = useState(node.attrs.language ? node.attrs.language : 'Plaintext')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleChange = (newLanguage: string) => {
    updateAttributes({ language: newLanguage })
    setLanguage(newLanguage)
    setPopoverOpen(false)
  }

  const customLanguageClass = `language-${language}`
  return (
    <YStack onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}>
      <XStack
        position="absolute"
        top={24}
        right={0}
        zIndex="$zIndex.5"
        ai="center"
        jc="flex-end"
        gap="$4"
        // @ts-ignore
        contentEditable={false}
        opacity={hovered ? 1 : 0}
        pointerEvents={hovered ? 'auto' : 'none'}
      >
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <Button
              onPress={() => setPopoverOpen(!popoverOpen)}
              size={20}
              fontSize={12}
              color="$gray9"
              backgroundColor="transparent"
            >
              {language} <ChevronDown color="$gray9" size={12} />
            </Button>
          </Popover.Trigger>

          <Popover.Content p={0}>
            <YStack borderRadius="$4" backgroundColor="$background" borderWidth={1} borderColor="$gray6">
              {/* List of selectable items */}
              <ScrollView maxHeight={200} padding="$2">
                {languages.map((lang) => (
                  <XStack
                    key={lang}
                    padding="$2"
                    alignItems="center"
                    justifyContent="space-between"
                    onPress={() => handleChange(lang)}
                    hoverStyle={{ backgroundColor: lang === language ? '$blue9' : 'rgba(0, 0, 0, 0.1)' }}
                    cursor="pointer"
                    width={200}
                    borderRadius="$2"
                    backgroundColor={lang === language ? '$blue9' : ''}
                  >
                    <SizableText fontSize={12}>{lang}</SizableText>
                  </XStack>
                ))}
              </ScrollView>
            </YStack>
          </Popover.Content>
        </Popover>
      </XStack>
      <pre>
        <code className={customLanguageClass}>
          <NodeViewContent />
        </code>
      </pre>
    </YStack>
  )
}

export default CodeBlockView
