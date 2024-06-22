import { Query } from "@/components/Editor/QueryInput";
import { useEffect, useState } from "react";

interface CreatePreviewFileProps {
  query: Query,
  editorContent: string,
}

/**
 * A function to handle creating or updating a preview file.
 */
const CreatePreviewFile: React.FC<CreatePreviewFileProps> = ({
  query,
  editorContent
}) => {
  const [queryChatWindow, setQueryChatWindow] = useState<string>("");

  /**
   * Updates the queryChatWindow state and attaches listeners for 
   *  ipc calls
   */
  useEffect(() => {
    /**
       * Updates state depending on content inside ChatCompletionChunk
       * 
       * @param chunk: response from LLM
       */
    const handleOpenAIChunk = (
      receivedChatID: string,
      chunk: ChatCompletionChunk
    ) => {
      const newContent = chunk.choices[0].delta.content ?? "";
      appendContentToInlineQueryWindow(newContent);
    }

    const openAITokenStreamListener = window.ipcRenderer.receive(
      "openAITokenStream",
      handleOpenAIChunk
    );

    return () => {
      openAITokenStreamListener();
    };
  }, [])

  const appendContentToInlineQueryWindow = (
    newContent: string
  ) => {
    setQueryChatWindow((prevContent) => {
      return prevContent + newContent;
    });
  }

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  useEffect(() => {
    const fetchLLMConfig = async () => {
      try {
        const defaultLLMName = await window.llm.getDefaultLLMName();
        const llmConfigs = await window.llm.getLLMConfigs();

        const currentModelConfig = llmConfigs.find(
          (config) => config.modelName === defaultLLMName
        );

        if (!currentModelConfig) {
          throw new Error(`No model config found for model: ${defaultLLMName}`);
        }

        console.log(
          `Default LLM: ${defaultLLMName}, CurrentModel: ${JSON.stringify(
            currentModelConfig
          )}`
        );

        query.displayableChatHistory.push({
          role: "system",
          content: "You are an expert in syntax and formatting, especially for enhancing note-taking efficiency and clarity. You will only follow the instructions given that relates to formatting. Do not provide extranneous information. The content will be given in JSON.",
          messageType: "info",
          context: [],
        })

        query.displayableChatHistory.push({
          role: "user",
          content: query.args[0],
          messageType: "success",
          context: [],
        });

        query.displayableChatHistory.push({
          role: "user",
          content: editorContent,

        })

        await window.llm.streamingLLMResponse(
          defaultLLMName,
          currentModelConfig,
          false,
          query
        );
      } catch (error) {
        console.error("Failed to fetch LLM Config:", error);
        // Handle errors as appropriate for your application
      }
    };

    fetchLLMConfig();
  }, []);

  return (
    <div className="flex-col p-4">
      {/*  */}
      <div className="w-full text-white flex justify-start">
        {/* Make it dynamic */}
        <h2>{capitalizeFirstLetter(query.options)} Display</h2>
      </div>

      {/* Display Query Request */}
      <div className="flex items-center">
        <div className="px-2 py-1 bg-blue-500 text-white rounded">Query</div>
        <p className="ml-2 text-white">{query.args[0]}</p>
      </div>
      <div className="w-full text-white bg-black p-4">{queryChatWindow}</div>
    </div>
  );
};

export default CreatePreviewFile;
