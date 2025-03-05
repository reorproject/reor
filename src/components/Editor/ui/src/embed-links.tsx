import { YStack, XStack, Button, Popover, Separator, Input, Theme, SizableText, Text } from 'tamagui'
import React, { useState, useEffect } from 'react'
import { IconType } from 'react-icons'
import { MediaType } from '@/components/Editor/types/media-render'

interface EmbedRenderProps {
  props: {
    mediaType: string
    icon?: IconType
    hint?: string
    uploadOptionHint?: string
    embedPlaceholder?: string
    embedOptionHint?: string
  }
  submit?: (
    assignMedia: (props: MediaType) => void,
    queryType: string,
    url?: string,
    setFileName?: any,
  ) => Promise<void>
  assign: (props: MediaType) => void
}

const EmbedComponent: React.FC<EmbedRenderProps> = ({ props, submit, assign }) => {
  // eslint-disable-next-line react/prop-types
  const { mediaType, icon, hint, uploadOptionHint, embedPlaceholder, embedOptionHint } = props
  const [url, setURL] = useState('')
  const [isClicked, setIsClicked] = useState(false)
  const [selectedOption, setSelectedOption] = useState('upload')
  const [errorRaised, setErrorRaised] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    })
  }, [])

  const handleClick = () => setIsClicked(!isClicked)

  return (
    <Popover 
      allowFlip 
      size="$5" 
      open={true}
      onOpenChange={() => setErrorRaised('')}
    >
      <Popover.Content
        borderWidth={1}
        borderColor="$color8"
        borderRadius={10}
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
        }}
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'medium',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        paddingTop={3}
        paddingHorizontal={12}
      >
        <Popover.Arrow borderWidth={1} borderColor="$color8" />
        <YStack gap="$2" width={300}>
          <XStack gap="$1">
            <Button
              size="$2"
              onPress={() => {
                setSelectedOption('upload')
                setIsClicked(false)
                setErrorRaised('')
              }}
              borderRadius={0}
              hoverStyle={{
                borderRadius: 8,
              }}
              fontWeight={selectedOption === 'upload' ? 'bold' : 'normal'}
            >
              Upload
            </Button>
            {mediaType === 'image' && (
              <Button
                size="$2"
                onPress={() => {
                  setSelectedOption('embed')
                  setIsClicked(false)
                  setErrorRaised('')
                }}
                borderRadius={0}
                hoverStyle={{
                  borderRadius: 8,
                }}
                fontWeight={selectedOption === 'embed' ? 'bold' : 'normal'}
              >
                Embed
              </Button>
            )}
          </XStack>

          <Separator />

          {selectedOption === 'upload' ? (
            <YStack gap="$3" paddingTop={3}>
              <Button
                size={14}
                color="$color8"
                fontFamily="$mono"
                padding={16}
                backgroundColor="hsl(0, 0%, 96.0%)"
                borderRadius="$4"
                hoverStyle={{
                  backgroundColor: 'hsl(0, 0%, 92.0%)',
                  cursor: 'pointer',
                }}
                onPress={() => {
                  if (submit) {
                    submit(assign, 'upload', undefined, setErrorRaised)
                  }
                  setErrorRaised('')
                }}
              >
                {uploadOptionHint}
              </Button>
            </YStack>
          ) : (
            mediaType === 'image' && (
              <YStack gap="$2">
                <Input
                  autoFocus
                  color="black"
                  height={32}
                  fontFamily="$mono"
                  backgroundColor={errorRaised ? '$color5' : 'color7'}
                  borderRadius="$4"
                  hoverStyle={{
                    backgroundColor: 'hsl(0, 0%, 92.0%)',
                  }}
                  focusStyle={{
                    outlineColor: '$blue7',
                    outlineWidth: 2,
                    outlineStyle: 'solid',
                  }}
                  placeholder={embedPlaceholder}
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setURL(e.target.value)}
                />
                {errorRaised && (
                  <SizableText size="$2" color="red" fontWeight="semiBold">
                    {errorRaised}
                  </SizableText>
                )}
                <XStack justifyContent="center">
                  <Theme name="blue">
                    <Button
                      width="50%"
                      size={14}
                      color="white"
                      fontFamily="$mono"
                      padding={16}
                      backgroundColor="$blue9"
                      borderRadius="$4"
                      hoverStyle={{
                        backgroundColor: '$blue8',
                        cursor: 'pointer',
                      }}
                      onPress={() => {
                        if (submit) {
                          submit(assign, 'embed', url, setErrorRaised)
                        }
                        setURL('')
                      }}
                    >
                      {embedOptionHint}
                    </Button>
                  </Theme>
                </XStack>
              </YStack>
            )
          )}
        </YStack>
      </Popover.Content>
    </Popover>
  )
}

export default EmbedComponent
