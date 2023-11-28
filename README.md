<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
   Local-First AI Personal Knowledge Management App
</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv2-blue.svg"></a>
    <a href="https://github.com/reorproject/reor/releases"><img alt="Releases" src="https://img.shields.io/github/release-date/public/public"></a>
    <a href="https://github.com/reorproject/reor/issues"><img alt="Issues" src="https://img.shields.io/github/issues/public/public"></a>
</p>

## About
**The Reor Project** is a local-first AI application for managing personal knowledge and notes. It's designed to be AI-first: knowledge is organised and augmented by AI. 

### Hypotheses
- AI should be used to both generate content but also organise unstructured corpuses of content.
- Notes should be embedded in a feature space and cosine similarity should be used.
- When crafting new thoughts or ideas, seeing similar thoughts or ideas can enhance that process.
- Running AI models locally is a must. OpenAI should not have access to _private_ thoughts.
- Open-source models are likely to outperform proprietary ones in specific tasks like query development and [knowledge graph creation](https://arxiv.org/abs/2310.04562).

### Features
- Chat with your notes.
- See similar notes in a sidebar within the Markdown editor.
- WYSIWYG Markdown editor.
- Local storage for notes and VectorDB.
- Tsne (coming soon)

### Powered by LanceDB & Electron
Uses [LanceDB](https://github.com/lancedb/lancedb) embedded vector database for low memory usage. Built with Electron for a seamless cross-platform experience.

### Getting Started
1. Download from the [Releases](https://github.com/reorproject/reor/releases) tab available for all major operating systems
2. Install like a normal App.

### Contribute
Contributions are welcome. Help with bugs, features, or documentation. See [Contributing Guide](link_to_contributing_guide).

### Alpha Phase
The Reor Project is in alpha. Feedback and support are welcome on our [Issues](https://github.com/reor-project/issues) page.

## License
GPL-2.0 license. See `LICENSE` for details.
