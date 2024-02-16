<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
A self-organizing AI note-taking app that runs models locally.</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/reorproject/reor">

</p>


## About
**Reor** is an AI-powered desktop note-taking app: it automatically links related ideas, answers questions on your notes and provides semantic search. Everything is stored locally and you can edit your notes with an Obsidian-like markdown editor. 

The hypothesis of the project is that AI tools for thought should **run models locally** by default. Reor stands on the shoulders of the giants [Llama.cpp](https://github.com/ggerganov/llama.cpp), [Transformers.js](https://github.com/xenova/transformers.js) & [LanceDB](https://github.com/lancedb/lancedb) to enable both LLMs and embedding models to run locally. (Connecting to OpenAI-compatible APIs like Oobabooga is also supported.)

### How can it possibly be "self-organizing"?

1.  Every note you write is chunked and embedded into an internal vector database.
2.  Related notes are connected automatically via vector similarity.
3.  LLM-powered Q&A does RAG on the corpus of notes.
4.  Everything can be searched semantically.

One way to think about Reor is as a RAG app with two generators: the LLM and the human. In Q&A mode, the LLM is fed retrieved context from the corpus to help answer a query. Similarly, in editor mode, the human can toggle the sidebar to reveal related notes "retrieved" from the corpus. This is quite a powerful way of "augmenting" your thoughts by cross-referencing ideas in a current note against related ideas from your corpus.

https://github.com/reorproject/reor/assets/17236551/1bbc1b2d-c3d9-451c-a008-7f12c84f96db


  
### Getting Started
1. Download from [reorproject.org](https://reorproject.org) or [releases](https://github.com/reorproject/reor/releases). Mac, Linux & Windows are all supported.
2. Install like a normal App.


### Running local models
Reor interacts directly with [Llama.cpp](https://github.com/ggerganov/llama.cpp) libraries so there's no need to download Ollama. Although right now, we don't download models for you so you'll need to download your model of choice manually:
1. Download a GGUF model file. [HuggingFace](https://huggingface.co/models?sort=downloads&search=gguf) has this nice page with the most popular models. I recommend starting with a 7B 4-bit model and see how that performs on your system.
2. Connect it in Reor settings under "Add a new local model".

You can also connect to an OpenAI-compatible API like Oobabooga, Ollama or OpenAI itself!

### Importing notes from other apps
Reor works within a single directory in the filesystem. You choose the directory on first boot.
To import notes/files from another app, you'll need to populate that directory manually with markdown files. Integrations with other apps are hopefully coming soon!


### Building from source
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

### Contributions
Contributions are welcome in all areas. Please raise an issue and discuss it before beginning work on a PR :)

## License
GPL-3.0 license. See `LICENSE` for details.

*Reor means "to think" in Latin.*
