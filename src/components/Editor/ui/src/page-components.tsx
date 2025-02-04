// @ts-nocheck
import { PropsWithChildren } from 'react'
import { H2, Main, SizableText, Stack, XStack, XStackProps, YStack, styled } from 'tamagui'
import { Container } from './container'

export function MainContainer({
  children,
  sidebarAfter,
  sidebarBefore,
}: {
  children: React.ReactNode
  sidebarAfter?: React.ReactElement
  sidebarBefore?: React.ReactElement
}) {
  return (
    <YStack flex={1} justifyContent="space-between">
      <YStack $gtXl={{ flexDirection: 'row', paddingTop: '$4' }} gap="$2">
        <YStack
          marginHorizontal={'auto'}
          paddingHorizontal="$4"
          width="100%"
          maxWidth={760}
          $gtXl={{
            borderTopWidth: 0,
            width: 300,
            overflow: 'scroll',
          }}
        >
          {sidebarBefore}
        </YStack>
        <Container tag="main" id="main-content" tabIndex={-1}>
          <Main>{children}</Main>
        </Container>
        <YStack
          marginHorizontal={'auto'}
          paddingHorizontal="$4"
          width="100%"
          maxWidth={760}
          borderColor="$gray6"
          gap="$2"
          borderTopWidth={1}
          paddingTop="$6"
          paddingBottom="$6"
          $gtXl={{
            paddingTop: 0,
            borderTopWidth: 0,
            width: 300,
            overflow: 'scroll',
          }}
        >
          {sidebarAfter}
        </YStack>
      </YStack>
    </YStack>
  )
}

export const SideContainer = styled(YStack, {
  width: '100%',
  gap: '$4',
  // paddingHorizontal: '$4',
  $gtLg: {
    width: '25%',
    maxWidth: 300,
  },
})

const PageSectionRoot = styled(Stack, {
  position: 'relative',
  flexDirection: 'column',
  width: '100%',
  $gtLg: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  justifyContent: 'center',
})

const PageSectionContent = styled(YStack, {
  alignSelf: 'stretch',
  width: '100%',
  flex: 1,
  maxWidth: 720,
  $gtLg: {
    flex: 3,
    flexGrow: 1,
    alignSelf: 'auto',
  },
})

const PageSectionSide = styled(YStack, {
  maxWidth: 720,
  alignSelf: 'center',
  width: '100%',
  $gtLg: {
    flex: 1,
    position: 'relative',
    maxWidth: 300,
    alignSelf: 'auto',
  },
})

export const SideSection = styled(YStack, {
  paddingVertical: '$4',
  gap: '$1',
  borderTopColor: '$color6',
  borderTopWidth: 1,
  marginHorizontal: '$4',
})

export const SideSectionTitle = styled(SizableText, {
  size: '$1',
  fontWeight: '800',
  opacity: 0.4,
  marginBottom: '$3',
})

const Root = PageSectionRoot

function Content({ children, ...props }: PropsWithChildren<XStackProps>) {
  return (
    <XStack f={1} jc="center" {...props}>
      <PageSectionContent>{children}</PageSectionContent>
    </XStack>
  )
}
const Side = PageSectionSide

export const PageSection = { Root, Content, Side }

export const PageHeading = styled(H2, {
  fontWeight: 'bold',
})
