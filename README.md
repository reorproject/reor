<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
   A local-first private AI Personal Knowledge Management Tool
</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
</p>

## About
**The Reor Project** is a local-first AI application for managing personal knowledge and notes. It's designed to be AI-first: knowledge is organised and augmented by AI. 

### Hypotheses
1. AI should be used to both generate and organise unstructured thoughts and ideas.
2. Those same thoughts and ideas are private. AI models should run _locally_.
3. Documents should be embedded in a feature space and cosine similarity should be used.
4. When crafting new thoughts or ideas, seeing similar thoughts or ideas can enhance that process.

### Features
- Chat with your notes.
- See similar notes in a sidebar within the Markdown editor.
- Semantic search
- WYSIWYG Markdown editor.
- Local storage for notes and VectorDB.
- Filesystem mapping. You own your own files.

### Powered by LanceDB & Transformers.js
Uses [LanceDB](https://github.com/lancedb/lancedb) embedded vector database for low memory usage and Transformers.js to run [bge-base-en-v1.5](https://huggingface.co/BAAI/bge-base-en-v1.5) embedding model.

### Getting Started
1. Download from the [Releases](https://github.com/reorproject/reor/releases) tab available currently for MacOS (intel & arm). Windows and Linux support coming by the end of the year.
2. Install like a normal App.

### Importing from other apps
Reor works within a single directory in the filesystem. You choose the directory on first boot.
To import notes/files from another app, you'll need to populate that directory manually with markdown files. Integrations with other apps are hopefully coming soon!

### Contribute
Contributions are welcome. Help with bugs, features, or documentation. See [Contributing Guide](link_to_contributing_guide).

### Beta Phase
The Reor Project is in beta. Feedback and support are welcome on our [Issues](https://github.com/reor-project/issues) page.

## License
GPL-3.0 license. See `LICENSE` for details.
