/* eslint react/destructuring-assignment: "off" */
import React, { useEffect, useState } from 'react'
import ResizeHandle from '@/components/Editor/ui/src/resize-handle'
import { Block, BlockNoteEditor, defaultProps, createReactBlockSpec } from '@/lib/blocknote'
import MediaContainer from '../media-container'
import { DisplayComponentProps, MediaRender, MediaType } from '../media-render'
import type { HMBlockSchema } from '../../schema'
import { isValidUrl } from '../utils'

const Display = ({ editor, block, selected, setSelected, assign }: DisplayComponentProps) => {
  const [imageUrl, setImageUrl] = useState(block.props.url)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true)
      try {
        if (block.props.url?.startsWith('local://')) {
          const localImage = await window.fileSystem.getImage(block.props.url)
          if (localImage) {
            setImageUrl(localImage)
          }
        } else {
          setImageUrl(block.props.url)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [block.props.url])

  // Min image width in px.
  const minWidth = 64
  let width: number = parseFloat(block.props.width) || editor.domElement.firstElementChild!.clientWidth
  const [currentWidth, setCurrentWidth] = useState(width)
  const [showHandle, setShowHandle] = useState(false)
  let resizeParams:
    | {
        handleUsed: 'left' | 'right'
        initialWidth: number
        initialClientX: number
      }
    | undefined

  useEffect(() => {
    if (block.props.width) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      width = parseFloat(block.props.width)
      setCurrentWidth(parseFloat(block.props.width))
    }
  }, [block.props.width])

  const windowMouseMoveHandler = (event: MouseEvent) => {
    if (!resizeParams) {
      return
    }

    let newWidth: number
    if (resizeParams.handleUsed === 'left') {
      newWidth = resizeParams.initialWidth + (resizeParams.initialClientX - event.clientX) * 2
    } else {
      newWidth = resizeParams.initialWidth + (event.clientX - resizeParams.initialClientX) * 2
    }

    // Ensures the image is not wider than the editor and not smaller than a
    // predetermined minimum width.
    if (newWidth < minWidth) {
      width = minWidth
      setCurrentWidth(minWidth)
    } else if (newWidth > editor.domElement.firstElementChild!.clientWidth) {
      width = editor.domElement.firstElementChild!.clientWidth
      setCurrentWidth(editor.domElement.firstElementChild!.clientWidth)
    } else {
      width = newWidth
      setCurrentWidth(newWidth)
    }
  }

  // Stops mouse movements from resizing the image and updates the block's
  // `width` prop to the new value.
  const windowMouseUpHandler = () => {
    setShowHandle(false)

    if (!resizeParams) {
      return
    }
    resizeParams = undefined

    assign({
      props: {
        width: width.toString(),
      },
    })

    // @ts-expect-error
    editor.updateBlock(block.id, {
      ...block,
      props: {
        width: width.toString(),
      },
    })
  }
  window.addEventListener('mousemove', windowMouseMoveHandler)
  window.addEventListener('mouseup', windowMouseUpHandler)

  // Hides the resize handles when the cursor leaves the image
  const imageMouseLeaveHandler = () => {
    if (resizeParams) {
      return
    }

    setShowHandle(false)
  }

  // Sets the resize params, allowing the user to begin resizing the image by
  // moving the cursor left or right.
  const leftResizeHandleMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    setShowHandle(true)

    resizeParams = {
      handleUsed: 'left',
      initialWidth: width || parseFloat(block.props.width),
      initialClientX: event.clientX,
    }
    editor.setTextCursorPosition(block.id, 'start')
  }

  const rightResizeHandleMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    setShowHandle(true)

    resizeParams = {
      handleUsed: 'right',
      initialWidth: width || parseFloat(block.props.width),
      initialClientX: event.clientX,
    }
    editor.setTextCursorPosition(block.id, 'start')
  }

  return (
    <MediaContainer
      editor={editor}
      block={block}
      mediaType="image"
      selected={selected}
      setSelected={setSelected}
      assign={assign}
      onHoverIn={() => {
        if (editor.isEditable) {
          setShowHandle(true)
        }
      }}
      onHoverOut={imageMouseLeaveHandler}
      width={currentWidth}
    >
      {showHandle && (
        <>
          <ResizeHandle left={4} onMouseDown={leftResizeHandleMouseDownHandler} />
          <ResizeHandle right={4} onMouseDown={rightResizeHandleMouseDownHandler} />
        </>
      )}
      {!isLoading && imageUrl && (
        <img
          style={{ width: `100%` }}
          src={imageUrl}
          alt={block.props.name || block.props.alt}
          contentEditable={false}
        />
      )}
    </MediaContainer>
  )
}


const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  const submitImage = async (
    assignMedia: (props: MediaType) => void,
    queryType: string,
    url?: string,
    setErrorRaised?: any,
  ) => {
    if (queryType === 'upload') {
      const filePaths = await window.fileSystem.openImageFileDialog()

      if (filePaths && filePaths.length > 0) {
        const filePath: string = filePaths[0]
        const fileData = await window.fileSystem.readFile(filePath, 'base64')
        const imageData = `data:image/png;base64,${fileData}`

        const storedImageUrl = await window.fileSystem.storeImage(imageData, filePath, block.id)
        assignMedia({
          id: block.id,
          props: {
            url: storedImageUrl,
            name: filePath,
          },
          children: [],
          content: [],
          type: 'image',
        })
      }
    }

    if (url && isValidUrl(url)) {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          setErrorRaised('Failed to fetch image')
        }
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = async () => {
          const imageData = reader.result as string
          const sanitizedURL = url.split('?')[0]
          const storedImageUrl = await window.fileSystem.storeImage(imageData, sanitizedURL, block.id)

          assignMedia({
            id: block.id,
            props: {
              url: storedImageUrl,
              name: url,
            },
            children: [],
            content: [],
            type: 'image',
          })
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        setErrorRaised('Failed to fetch image')
      }
    } else {
      setErrorRaised('Invalid URL')
    }
  }

  return (
    <MediaRender
      block={block}
      hideForm={!!block.props.url}
      editor={editor}
      mediaType="image"
      submit={submitImage}
      DisplayComponent={Display}
    />
  )
}

const ImageBlock = createReactBlockSpec({
  type: 'image',
  propSchema: {
    ...defaultProps,
    url: {
      default: '',
    },
    alt: {
      default: '',
    },
    name: {
      default: '',
    },
    width: {
      default: '',
    },
    defaultOpen: {
      values: ['false', 'true'],
      default: 'false',
    },
  },
  containsInlineContent: true,

  render: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) =>
    Render(block, editor),

  parseHTML: [
    {
      tag: 'img[src]',
      getAttrs: (element: any) => {
        const name = element.getAttribute('title')
        const width = element.getAttribute('width') || element.style.width
        const alt = element.getAttribute('alt')
        return {
          url: element.getAttribute('src'),
          name,
          width,
          alt,
        }
      },
      node: 'image',
    },
  ],
})

export default ImageBlock
