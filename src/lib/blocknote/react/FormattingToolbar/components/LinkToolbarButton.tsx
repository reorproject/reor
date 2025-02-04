import Tippy from '@tippyjs/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ToolbarButton, ToolbarButtonProps } from '../../SharedComponents/Toolbar/components/ToolbarButton'

type HyperlinkButtonProps = ToolbarButtonProps & {
  hyperlinkIsActive: boolean
  activeHyperlinkUrl: string
  activeHyperlinkText: string
  setHyperlink: (url: string, text?: string) => void
}

/**
 * The link menu button opens a tooltip on click
 */
export const LinkToolbarButton = (props: HyperlinkButtonProps) => {
  const [creationMenu, setCreationMenu] = useState<any>()
  const [creationMenuOpen, setCreationMenuOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (buttonRef.current?.contains(event.target as HTMLElement)) {
        setCreationMenuOpen(!creationMenuOpen)
        return
      }

      if (menuRef.current?.contains(event.target as HTMLElement)) {
        return
      }

      setCreationMenuOpen(false)
    },
    [creationMenuOpen],
  )

  useEffect(() => {
    document.body.addEventListener('click', handleClick)
    return () => document.body.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <Tippy content={creationMenu} interactive={true} maxWidth={500} visible={creationMenuOpen}>
      <ToolbarButton
        isSelected={props.isSelected}
        mainTooltip={props.mainTooltip}
        secondaryTooltip={props.secondaryTooltip}
        icon={props.icon}
        ref={buttonRef}
        // @ts-ignore
        onClick={handleClick}
      />
    </Tippy>
  )
}

export default LinkToolbarButton
