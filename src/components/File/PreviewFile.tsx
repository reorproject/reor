import React, { useEffect } from "react";

/**
 * A function to handle creating or updating a preview file.
 */
const CreatePreviewFile = ({ query }) => {
  console.log(`Displaying preview file:`, query);

  const TEMPORARY_CONTENT = `
        This is just a test

        In Reality, it would contain the content of the query executing on the editor


        !!!!
    `;

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
      <div className="w-full text-white bg-black p-4">{TEMPORARY_CONTENT}</div>
    </div>
  );
};

export default CreatePreviewFile;
