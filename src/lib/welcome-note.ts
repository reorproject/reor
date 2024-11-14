const welcomeNote = `## Welcome to Reor!

Reor is a private AI personal knowledge management tool. Our philosophy is that AI should be a thought enhancer not a thought replacer: Reor helps you find & connect notes, discover new insights and enhance your reasoning.

Some features you should be aware of:

- **Chat:**

  - Ask your entire set of notes anything you want to know! Reor will automatically give the LLM relevant context.

  - Ask things like “What are my thoughts on philosophy?” or “Summarize my notes on black holes"

  - In settings, you can attach a local LLM or connect to OpenAI models with your API key.

  - LLMs can be provided 'tools' like search, create files, and more. This is powerful for getting the LLM to act agentically in your knowledge base.

  - You can also edit the system prompt provided to the LLM.

- **Writing assistant:**

  - Reor has a built-in writing assistant that can help you with your writing.

  - You can trigger it by hitting space on a newline or selecting text and hitting the icon that appears.

- **Links:**

  - Reor automatically links your notes to other notes in the Related Notes sidebar.

  - You can view the Related Notes to a particular chunk of text by highlighting it and hitting the button that appears.

  - You can also create inline links by surrounding text with two square brackets (like in Obsidian). [[Like this]]

You can import notes from other apps by adding markdown files to your vault directory. Note that Reor will only read markdown files.

Please join our [Discord community](https://discord.gg/QBhGUFJYuH) to ask questions, give feedback, and get help. We're excited to have you on board!`

export default welcomeNote
