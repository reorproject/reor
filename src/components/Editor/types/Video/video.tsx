/* eslint react/destructuring-assignment: "off" */
import React, { useEffect, useState } from 'react'
import { isValidUrl, youtubeParser } from '../utils'
import { XStack } from '@/components/Editor/ui/src'
import ResizeHandle from '@/components/Editor/ui/src/resize-handle'
import { Block, BlockNoteEditor, defaultProps, createReactBlockSpec } from '@/lib/blocknote'
import MediaContainer from '../media-container'
import { DisplayComponentProps, MediaRender, MediaType } from '../media-render'
import type { HMBlockSchema } from '../../schema'

export const getSourceType = (name: string) => {
  const nameArray = name.split('.')
  return nameArray[nameArray.length - 1] ? `video/${nameArray[nameArray.length - 1]}` : undefined
}

/**
 *  Depending on start of video data type, uses
 *  <video /> html element or <XStack />
 */
export function displayVideoType(videoURL: string) {
  if (videoURL.startsWith('data:video/')) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video controls width="100%" preload="metadata">
        <source src={videoURL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }
  return (
    <XStack
      width="100%"
      pointerEvents="auto"
      tag="iframe"
      className="video-iframe"
      // @ts-expect-error
      src={videoURL}
      frameBorder="0"
      allowFullScreen
    />
  )
}

const Display = ({ editor, block, selected, setSelected, assign }: DisplayComponentProps) => {
  const [videoURL, setVideoURL] = useState(block.props.url)
  const [isLoading, setIsLoading] = useState(true)

  // Min video width in px.
  const minWidth = 256
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

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true)
      try {
        if (block.props.url?.startsWith('local://')) {
          const localVideo = await window.fileSystem.getVideo(block.props.url)
          if (localVideo) {
            setVideoURL(localVideo)
          }
        } else {
          setVideoURL(block.props.url)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadVideo()
  }, [block.props.url])

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

    // Ensures the video is not wider than the editor and not smaller than a
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

  // Stops mouse movements from resizing the video and updates the block's
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

  // Hides the resize handles when the cursor leaves the video
  const videoMouseLeaveHandler = () => {
    if (resizeParams) {
      return
    }

    setShowHandle(false)
  }

  // Sets the resize params, allowing the user to begin resizing the video by
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
      mediaType="video"
      selected={selected}
      setSelected={setSelected}
      assign={assign}
      onHoverIn={() => {
        if (editor.isEditable) {
          setShowHandle(true)
        }
      }}
      onHoverOut={videoMouseLeaveHandler}
      width={currentWidth}
    >
      {showHandle && (
        <>
          <ResizeHandle left={4} onMouseDown={leftResizeHandleMouseDownHandler} />
          <ResizeHandle right={4} onMouseDown={rightResizeHandleMouseDownHandler} />
        </>
      )}
      {isLoading ? (
        <div className="flex h-32 w-full items-center justify-center bg-gray-100">Loading video...</div>
      ) : (
        displayVideoType(videoURL)
      )}
    </MediaContainer>
  )
}

const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  const submitVideo = async (
    assignMedia: (props: MediaType) => void,
    queryType: string,
    url?: string,
    setErrorRaised?: any,
  ) => {
    if (queryType === 'upload') {
      const filePaths = await window.fileSystem.openVideoFileDialog()

      if (filePaths && filePaths.length > 0) {
        const filePath: string = filePaths[0]
        const fileData = await window.fileSystem.readFile(filePath, 'base64')
        const videoData = `data:video/mp4;base64,${fileData}`
        const { id } = block

        const storedVideoUrl = await window.fileSystem.storeVideo(videoData, filePath, id)
        assignMedia({
          id,
          props: {
            url: storedVideoUrl,
            name: filePath,
          },
          children: [],
          content: [],
          type: 'video',
        })
      }
    } else if (url && isValidUrl(url)) {
      let embedUrl = 'https://www.youtube.com/embed/'
      if (url.includes('youtu.be') || url.includes('youtube')) {
        const ytId = youtubeParser(url)
        if (ytId) {
          embedUrl += ytId
        } else {
          setErrorRaised(`Unsupported Youtube URL`)
          return
        }
      } else if (url.includes('vimeo')) {
        const urlArray = url.split('/')
        embedUrl = `https://player.vimeo.com/video/${urlArray[urlArray.length - 1]}`
      } else {
        setErrorRaised(`Unsupported video source.`)
        return
      }
      assignMedia({ props: { url: embedUrl } } as MediaType)
    } else {
      setErrorRaised(`The provided URL is invalid`)
      return
    }
    const cursorPosition = editor.getTextCursorPosition()
    editor.focus()
    if (cursorPosition.block.id === block.id) {
      if (cursorPosition.nextBlock) editor.setTextCursorPosition(cursorPosition.nextBlock, 'start')
      else {
        editor.insertBlocks([{ type: 'paragraph', content: '' }], block.id, 'after')
        editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!, 'start')
      }
    }
  }

  return (
    <MediaRender
      block={block}
      hideForm={!!block.props.url}
      editor={editor}
      mediaType="video"
      submit={submitVideo}
      DisplayComponent={Display}
    />
  )
}

export const VideoBlock = createReactBlockSpec({
  type: 'video',
  propSchema: {
    ...defaultProps,
    url: {
      default: '',
    },
    src: {
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
  // @ts-ignore
  render: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) =>
    Render(block, editor),

  parseHTML: [
    {
      tag: 'video[src]',
      getAttrs: (element: any) => {
        return { url: element.getAttribute('src') }
      },
    },
    {
      tag: 'iframe',
      getAttrs: (element: any) => {
        return { url: element.getAttribute('src'), width: element.getAttribute('width') }
      },
    },
  ],
})
