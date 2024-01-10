<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
   A self-organizing note-taking app powered by local AI models.
</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
</p>
<!-- <img width="1342" alt="Screenshot 2024-01-10 at 18 43 31" src="https://github.com/reorproject/reor/assets/17236551/336ff84d-cecc-44de-bd92-57ff61579dea"> -->
<!-- <img width="1203" alt="Screenshot 2024-01-10 at 18 24 55" src="https://github.com/reorproject/reor/assets/17236551/cde5ab19-b394-459e-8657-bfc4f204014f"> -->
<!-- <img width="1202" alt="Screenshot 2024-01-10 at 18 50 03" src="https://github.com/reorproject/reor/assets/17236551/c85fdc6b-057f-4693-829a-d0e45da6113e"> -->
<!-- <img width="1200" alt="Screenshot 2024-01-10 at 18 54 02" src="https://github.com/reorproject/reor/assets/17236551/e6d3b7af-d3f4-4ffe-a2a6-f4682beaff06"> -->
<img width="1200" alt="gray-screenshot" src="https://github.com/reorproject/reor/assets/17236551/157ef4a9-6d73-4a30-91d3-1c36b8296197">

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
1. Download from the [Releases](https://github.com/reorproject/reor/releases) tab. Mac & Windows are currently supported with Linux support coming soon.
2. Install like a normal App.

### App is damaged error on Apple Silicon
Apple is sometimes rather pesky with build requirements. Because Reor is built to run models locally, Apple sometimes tells you the app is damaged when you try to open it. Just run this to avoid that:
```
sudo xattr -rds com.apple.quarantine /Applications/Reor.app
```

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
