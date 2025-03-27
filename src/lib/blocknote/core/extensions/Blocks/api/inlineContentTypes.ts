export type Styles = {
  bold?: true
  italic?: true
  underline?: true
  strike?: true
  code?: true
  textColor?: string
  backgroundColor?: string
}

export type ToggledStyle = {
  [K in keyof Styles]-?: Required<Styles>[K] extends true ? K : never
}[keyof Styles]

export type ColorStyle = {
  [K in keyof Styles]-?: Required<Styles>[K] extends string ? K : never
}[keyof Styles]

export type StyledText = {
  type: 'text'
  text: string
  styles: Styles
}

export type BNLink = {
  type: 'link'
  href: string
  content: StyledText[]
}

export type InlineEmbed = {
  type: 'inline-embed'
  link: string
}

export type PartialLink = Omit<BNLink, 'content'> & {
  content: string | BNLink['content']
}

export type InlineContent = StyledText | BNLink | InlineEmbed
export type PartialInlineContent = StyledText | PartialLink
