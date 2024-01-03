<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
   A self-organizing note-taking tool powered by local AI models
</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
</p>

## About
**The Reor Project** is a local-first AI application for managing personal knowledge and notes. It uses AI to organize, help write, and answer questions about notes. The key difference between something like mem.ai or Reflect Notes is that the AI models can run fully locally and privately.

### Hypotheses
1. AI should be used to both generate and organise unstructured thoughts and ideas.
2. Those same thoughts and ideas are private. AI models should run _locally_.
3. Notes should be embedded into a feature space so that similar notes can be compared

### Features
- Q&A with your notes.
- Embedding sidebar to automatically connect similar notes.
- Semantic search.
- WYSIWYG Markdown editor.
- Markdown files stored locally.


### Getting Started
1. Download from the [Releases](https://github.com/reorproject/reor/releases) tab available currently for MacOS (Intel & Arm). Windows and Linux support coming soon :)
2. Install like a normal App.
   
### Technologies
- [LanceDB](https://github.com/lancedb/lancedb) vector database for ultra low latency, low-memory and local vector store.
- [Transformers.js](https://github.com/xenova/transformers.js) to run embedding models locally.
- [Llama.cpp](https://github.com/ggerganov/llama.cpp) to run local LLMs uber efficiently.

### Importing from other apps
Reor works within a single directory in the filesystem. You choose the directory on first boot.
To import notes/files from another app, you'll need to populate that directory manually with markdown files. Integrations with other apps are hopefully coming soon!


### Beta Phase
The Reor Project is in beta. It is very much stable and usable right now. Of course, it won't be as bug-free as something like Obsidian. But I am working as hard as I can to make this as good of an experience as can be! Feedback and support are welcome on our [Issues](https://github.com/reor-project/issues) page.

## License
GPL-3.0 license. See `LICENSE` for details.
