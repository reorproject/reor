<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
Private & local AI personal knowledge management app.</h4>

<p align="center">
    <a href="https://tooomm.github.io/github-release-stats/?username=reorproject&repository=reor">    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/reorproject/reor/total"></a>
<a href="https://discord.gg/b7zanGCTUY" target="_blank"><img src="https://dcbadge.vercel.app/api/server/QBhGUFJYuH?style=flat&compact=true" alt="Discord"></a>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/reorproject/reor">

</p>

> ### 📢 Announcement
>
> We are now on [Discord](https://discord.gg/b7zanGCTUY)! Our team is shipping very quickly right now so sharing ❤️feedback❤️ with us will really help shape the product 🚀

## About

**Reor** is an AI-powered desktop note-taking app: it automatically links related notes, answers questions on your notes, provides semantic search and can generate AI flashcards. Everything is stored locally and you can edit your notes with an Obsidian-like markdown editor.

The hypothesis of the project is that AI tools for thought should run models locally _by default_. Reor stands on the shoulders of the giants [Ollama](https://github.com/ollama/ollama), [Transformers.js](https://github.com/xenova/transformers.js) & [LanceDB](https://github.com/lancedb/lancedb) to enable both LLMs and embedding models to run locally:

1.  Every note you write is chunked and embedded into an internal vector database.
2.  Related notes are connected automatically via vector similarity.
3.  LLM-powered Q&A does RAG on your corpus of notes.
4.  Everything can be searched semantically.

https://github.com/reorproject/reor/assets/17236551/94a1dfeb-3361-45cd-8ebc-5cfed81ed9cb

One way to think about Reor is as a RAG app with two generators: the LLM and the human. In Q&A mode, the LLM is fed retrieved context from the corpus to help answer a query. Similarly, in editor mode, the human can toggle the sidebar to reveal related notes "retrieved" from the corpus. This is quite a powerful way of "augmenting" your thoughts by cross-referencing ideas in a current note against related ideas from your corpus.

### Getting Started

1. Download from [reorproject.org](https://reorproject.org) or [releases](https://github.com/reorproject/reor/releases). Mac, Linux & Windows are all supported.
2. Install like a normal App.

### Running local models

Reor interacts directly with Ollama which means you can download and run models locally right from inside Reor. Head to Settings->Add New Local LLM then enter the name of the model you want Reor to download. You can find available models [here](https://ollama.com/library).

You can also [connect to an OpenAI-compatible API](https://www.reorproject.org/docs/documentation/openai-like-api) like Oobabooga, Ollama or OpenAI itself!

### Importing notes from other apps

Reor works within a single directory in the filesystem. You choose the directory on first boot.
To import notes/files from another app, you'll need to populate that directory manually with markdown files. Note that if you have frontmatter in your markdown files it may not parse correctly. Integrations with other apps are hopefully coming soon!

### Building from source

Make sure you have [nodejs](https://nodejs.org/en/download) installed.

#### Clone repo:

```
git clone https://github.com/reorproject/reor.git
```

#### Install dependencies:

```
npm install
```

#### Run for dev:

```
npm run dev
```

#### Build:

```
npm run build
```

### Interested in contributing?

We are always on the lookout for contributors keen on building the future of knowledge management. Have a feature idea? Want to squash a bug? Want to improve some styling? We'd love to hear it. Check out our issues page and the [contributing guide](https://www.reorproject.org/docs/documentation/contributing) to get started.

## License

AGPL-3.0 license. See `LICENSE` for details.

_Reor means "to think" in Latin._
