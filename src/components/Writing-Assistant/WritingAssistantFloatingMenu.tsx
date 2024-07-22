import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

import { MessageStreamEvent } from '@anthropic-ai/sdk/resources'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Editor } from '@tiptap/react'
import { ChatCompletionChunk } from 'openai/resources/chat/completions'
import { FaMagic } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { ChatHistory, ChatMessageToDisplay, formatOpenAIMessageContentIntoString } from '../Chat/chatUtils'
import useOutsideClick from '../Chat/hooks/use-outside-click'
import { HighlightData } from '../Editor/HighlightExtension'

interface WritingAssistantProps {
  editor: Editor | null
  highlightData: HighlightData
  currentChatHistory: ChatHistory | undefined
  setCurrentChatHistory: React.Dispatch<React.SetStateAction<ChatHistory | undefined>>
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({
  editor,
  highlightData,
  currentChatHistory,
  setCurrentChatHistory,
}) => {
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false);
  const [prevPrompt, setPrevPrompt] = useState<string>("");
  const [positionStyle, setPositionStyle] = useState({ top: 0, left: 0 });
  const [markdownMaxHeight, setMarkdownMaxHeight] = useState("auto");
  const markdownContainerRef = useRef(null);
  const optionsContainerRef = useRef(null);
  const hasValidMessages = currentChatHistory?.displayableChatHistory.some(
    (msg) => msg.role === "assistant"
  );
  const lastAssistantMessage = currentChatHistory?.displayableChatHistory
    .filter((msg) => msg.role === 'assistant')
    .pop()

  useOutsideClick(markdownContainerRef, () => {
    setCurrentChatHistory(undefined)
  })
  useOutsideClick(optionsContainerRef, () => {
    setIsOptionsVisible(false)
  })

  useEffect(() => {
    if (hasValidMessages) {
      setIsOptionsVisible(false)
    }
  }, [hasValidMessages]);

  useLayoutEffect(() => {
    if (!isOptionsVisible) return;

    const calculatePosition = () => {
      if (!optionsContainerRef.current) {
        console.log("Ref not attached yet");
        return;
      }

      const screenHeight = window.innerHeight;
      const elementHeight = optionsContainerRef.current.offsetHeight;
      const spaceBelow = screenHeight - highlightData.position.top;
      const isSpaceEnough = spaceBelow >= elementHeight;

      if (isSpaceEnough) {
        setPositionStyle({
          top: highlightData.position.top,
          left: highlightData.position.left,
        });
      } else {
        setPositionStyle({
          top: highlightData.position.top - elementHeight,
          left: highlightData.position.left,
        });
      }
    };

    calculatePosition();
  }, [isOptionsVisible, highlightData.position]);

  useLayoutEffect(() => {
    if (hasValidMessages && highlightData && highlightData.position) {
      const calculateMaxHeight = () => {
        if (!markdownContainerRef.current) return;

        const screenHeight = window.innerHeight;
        const containerTop = positionStyle.top;
        const buttonHeight = 30;
        const padding = 54;
        const availableHeight =
          screenHeight - containerTop - buttonHeight - padding;

        setMarkdownMaxHeight(`${availableHeight}px`);
      };

      calculateMaxHeight();
      window.addEventListener("resize", calculateMaxHeight);

      return () => window.removeEventListener("resize", calculateMaxHeight);
    }
  }, [hasValidMessages, highlightData]);

  const copyToClipboard = () => {
    if (!editor || !currentChatHistory || currentChatHistory.displayableChatHistory.length === 0) {
      return
    }
    const llmResponse = currentChatHistory.displayableChatHistory[currentChatHistory.displayableChatHistory.length - 1]

    const copiedText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content)

    if (copiedText) navigator.clipboard.writeText(copiedText)
  }
  const insertAfterHighlightedText = () => {
    if (!editor || !currentChatHistory || currentChatHistory.displayableChatHistory.length === 0) {
      return
    }

    const llmResponse = currentChatHistory.displayableChatHistory[currentChatHistory.displayableChatHistory.length - 1]

    const insertionText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content)

    editor.view.focus()

    const { from, to } = editor.state.selection
    const endOfSelection = Math.max(from, to)

    editor.chain().focus().setTextSelection(endOfSelection).insertContent(`\n${insertionText}`).run()

    setCurrentChatHistory(undefined)
  }

  const replaceHighlightedText = () => {
    if (!editor || !currentChatHistory || currentChatHistory.displayableChatHistory.length === 0) {
      return
    }

    const llmResponse = currentChatHistory.displayableChatHistory[currentChatHistory.displayableChatHistory.length - 1]

    const replacementText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content)

    if (replacementText) {
      editor.chain().focus().deleteSelection().insertContent(replacementText).run()
    }

    setCurrentChatHistory(undefined)
  }

  const getLLMResponse = async (prompt: string, chatHistory: ChatHistory | undefined) => {
    const defaultLLMName = await window.llm.getDefaultLLMName()
    const llmConfigs = await window.llm.getLLMConfigs()

    const currentModelConfig = llmConfigs.find((config) => config.modelName === defaultLLMName)
    if (!currentModelConfig) {
      throw new Error(`No model config found for model: ${defaultLLMName}`)
    }

    if (loadingResponse) return
    setLoadingResponse(true)
    // make a new variable for chat history to not use the function parameter:
    let newChatHistory = chatHistory
    if (!newChatHistory || !newChatHistory.id) {
      const chatID = Date.now().toString()
      newChatHistory = {
        id: chatID,
        displayableChatHistory: [],
      }
    }
    setCurrentChatHistory(newChatHistory)
    newChatHistory.displayableChatHistory.push({
      role: 'user',
      content: prompt,
      messageType: 'success',
      context: [],
    })
    if (!newChatHistory) return

    await window.llm.streamingLLMResponse(defaultLLMName, currentModelConfig, false, newChatHistory)
    setLoadingResponse(false)
  }

  const handleOption = async (option: string, customPromptInput?: string) => {
    const selectedText = highlightData.text
    if (!selectedText.trim()) return

    let prompt = ''

    switch (option) {
      case 'simplify':
        prompt = `The following text in triple quotes below has already been written:
"""
${selectedText}
"""
Simplify and condense the writing. Do not return anything other than the simplified writing. Do not wrap responses in quotes.`
        break
      case 'copy-editor':
        prompt = `Act as a copy editor. Go through the text in triple quotes below. Edit it for spelling mistakes, grammar issues, punctuation, and generally for readability and flow. Format the text into appropriately sized paragraphs. Make your best effort.
 
""" ${selectedText} """
Return only the edited text. Do not wrap your response in quotes. Do not offer anything else other than the edited text in the response. Do not translate the text. If in doubt, or you can't make edits, just return the original text.`
        break
      case 'takeaways':
        prompt = `My notes are below in triple quotes:
""" ${selectedText} """
Write a markdown list (using dashes) of key takeaways from my notes. Write at least 3 items, but write more if the text requires it. Be very detailed and don't leave any information out. Do not wrap responses in quotes.`
        break
      default:
        prompt =
          'The user has given the following instructions(in triple #) for processing the text selected(in triple quotes): ' +
          `### ${customPromptInput} ###` +
          '\n' +
          `  """ ${selectedText} """`
        break
    }
    setPrevPrompt(prompt);
    await getLLMResponse(prompt, currentChatHistory);
  };

  const getLLMResponse = async (
    prompt: string,
    chatHistory: ChatHistory | undefined
  ) => {
    const defaultLLMName = await window.llm.getDefaultLLMName();
    const llmConfigs = await window.llm.getLLMConfigs();

    const currentModelConfig = llmConfigs.find(
      (config) => config.modelName === defaultLLMName
    );
    if (!currentModelConfig) {
      throw new Error(`No model config found for model: ${defaultLLMName}`);
    }

    try {
      if (loadingResponse) return;
      setLoadingResponse(true);
      if (!chatHistory || !chatHistory.id) {
        const chatID = Date.now().toString();
        chatHistory = {
          id: chatID,
          displayableChatHistory: [],
        };
      }
      setCurrentChatHistory(chatHistory);
      chatHistory.displayableChatHistory.push({
        role: "user",
        content: prompt,
        messageType: "success",
        context: [],
      });
      if (!chatHistory) return;

      await window.llm.streamingLLMResponse(
        defaultLLMName,
        currentModelConfig,
        false,
        chatHistory
      );
    } catch (error) {
      console.error(error);
    }
    setLoadingResponse(false);
  };

  const appendNewContentToMessageHistory = (
    chatID: string,
    newContent: string,
    newMessageType: "success" | "error"
  ) => {
    setCurrentChatHistory((prev) => {
      if (chatID !== prev?.id) return prev;
      const newDisplayableHistory = prev?.displayableChatHistory || [];
      if (newDisplayableHistory.length > 0) {
        const lastMessage =
          newDisplayableHistory[newDisplayableHistory.length - 1];

        if (lastMessage.role === "assistant") {
          lastMessage.content += newContent;
          lastMessage.messageType = newMessageType;
        } else {
          newDisplayableHistory.push({
            role: 'assistant',
            content: newContent,
            messageType: newMessageType,
            context: [],
          })
        }
        return {
          id: prev!.id,
          displayableChatHistory: newDisplayableHistory,
          openAIChatHistory: newDisplayableHistory.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }
      })
    }
    const handleOpenAIChunk = async (receivedChatID: string, chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? ''
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const handleAnthropicChunk = async (receivedChatID: string, chunk: MessageStreamEvent) => {
      const newContent = chunk.type === 'content_block_delta' ? (chunk.delta.text ?? '') : ''
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const removeOpenAITokenStreamListener = window.ipcRenderer.receive('openAITokenStream', handleOpenAIChunk)

    const removeAnthropicTokenStreamListener = window.ipcRenderer.receive('anthropicTokenStream', handleAnthropicChunk)

    return () => {
      removeOpenAITokenStreamListener()
      removeAnthropicTokenStreamListener()
    }
  }, [setCurrentChatHistory])

  function getClassNames(message: ChatMessageToDisplay) {
    if (message.messageType === 'error') {
      return 'bg-red-100 text-red-800'
    }
    if (message.role === 'assistant') {
      return 'bg-neutral-200 text-black'
    }
    return 'bg-blue-100 text-blue-800'
  }
  if (!highlightData.position) return null

  return (
    <div>
      <button
        style={{
          top: `${highlightData.position.top}px`,
          left: `${highlightData.position.left + 30}px`,
          zIndex: 50,
        }}
        className="absolute flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-gray-600 shadow-md hover:bg-gray-300"
        aria-label="Writing Assistant button"
        onClick={() => setIsOptionsVisible(true)}
        type="button"
      >
        <FaMagic />
      </button>
      {!hasValidMessages && isOptionsVisible && (
        <div
          ref={optionsContainerRef}
          style={{
            top: positionStyle.top,
            left: positionStyle.left,
          }}
          className="absolute z-50 w-96 rounded-md border border-gray-300 bg-white p-2.5"
        >
          <TextField
            type="text"
            variant="outlined"
            size="small"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI anything..."
            className="mb-2.5 p-1 w-full"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleOption('custom', customPrompt)
              }
            }}
          />
          <div className="max-h-36 overflow-y-auto">
            <Button
              onClick={() => handleOption('simplify')}
              className="mb-1 block w-full"
              style={{ textTransform: 'none' }}
            >
              Simplify and condense the writing
            </Button>
            <Button
              onClick={() => handleOption('copy-editor')}
              className="mb-1 block w-full"
              style={{ textTransform: 'none' }}
            >
              Fix spelling and grammar
            </Button>
            <Button
              onClick={() => handleOption('takeaways')}
              className="mb-1 block w-full"
              style={{ textTransform: 'none' }}
            >
              List key Takeaways
            </Button>
          </div>
        </div>
      )}
      {hasValidMessages && (
        <div
          ref={markdownContainerRef}
          className="absolute z-50 rounded-lg border border-gray-300 bg-white p-2.5 shadow-md"
          style={{
            top: positionStyle.top,
            left: positionStyle.left,
            width: "385px",
          }}
        >
          <div
            style={{
              maxHeight: markdownMaxHeight,
              overflowY: "auto",
            }}
          >
            {lastAssistantMessage && (
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                className={`p-1 markdown-content break-words rounded-md ${
                  lastAssistantMessage.messageType === "error"
                    ? "bg-red-100 text-red-800"
                    : lastAssistantMessage.role === "assistant"
                    ? "bg-neutral-200 text-black"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {lastAssistantMessage.visibleContent
                  ? lastAssistantMessage.visibleContent
                  : formatOpenAIMessageContentIntoString(
                      lastAssistantMessage.content
                    )}
              </ReactMarkdown>
            )}
          </div>
          <div className="flex justify-between mt-2">
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                getLLMResponse(prevPrompt, currentChatHistory)
              }}
              type="button"
            >
              Re-run
            </button>
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                insertAfterHighlightedText()
              }}
              type="button"
            >
              Insert
            </button>
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                copyToClipboard()
              }}
              type="button"
            >
              Copy
            </button>
            <button
              className="flex cursor-pointer items-center rounded-md border-0 bg-indigo-700 px-2.5 py-1 text-white"
              onClick={() => {
                replaceHighlightedText()
              }}
              type="button"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WritingAssistant
