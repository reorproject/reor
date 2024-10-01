import React from 'react'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  className?: string // Add optional className prop
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href: url, children, className = '' }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    window.electronUtils.openExternal(url)
  }

  return (
    <a href={url} onClick={handleLinkClick} className={className}>
      {children}
    </a>
  )
}

export default ExternalLink
