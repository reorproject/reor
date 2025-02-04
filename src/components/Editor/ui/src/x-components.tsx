import { Separator } from '@tamagui/separator'
import { YStack } from '@tamagui/stacks'
import { SizableText } from '@tamagui/text'

export const XPostNotFound = (error: any) => {
  const errorToString = error.error
    ? error.error.status == 404
      ? 'The embedded X Post could not be found.'
      : error.error.toString()
    : ''

  return (
    <YStack
      // @ts-ignore
      contentEditable={false}
      display="flex"
      flexDirection="column"
      width={'100%'}
      height={'100%'}
      ac="center"
      ai="center"
    >
      <SizableText size="$7" fontSize="$5" color="$red10">
        Error fetching the X Post
      </SizableText>
      <SizableText size="$5" fontSize="$4" color="$red10">
        {errorToString}
      </SizableText>
    </YStack>
  )
}

export const XPostSkeleton = () => {
  return (
    <YStack
      // @ts-ignore
      contentEditable={false}
      width={'100%'}
      height={'100%'}
      gap="$2"
    >
      <YStack width={50} height={50} margin="$2" backgroundColor="$color6" borderRadius="$10" />
      <YStack marginLeft="$2" width="98%" borderRadius="$3" height={150} backgroundColor="$color6" />
      <Separator marginTop="$2" marginBottom="$2" />
      <YStack marginLeft="$2" width="98%" borderRadius="$3" height={25} backgroundColor="$color6" />
      <YStack marginLeft="$2" width="98%" borderRadius="$3" height={25} backgroundColor="$color6" />
    </YStack>
  )
}
