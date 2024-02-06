<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
An AI note-taking app that runs models locally.</h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/reorproject/reor">

</p>


## About
**The Reor Project** is a personal knowledge management tool powered by AI: It connects together related ideas, provides semantic search and can answer questions with the full context of your knowledge base. Everything is stored locally and you can edit your notes with an Obsidian-like markdown editor. 

Reor was built right from the very start to **run models locally**. We believe running models locally *(and privately)* is essential: no one entity should be in control of AGI and put it behind a black box, no matter how "open" they claim to be. 



https://github.com/reorproject/reor/assets/17236551/1bbc1b2d-c3d9-451c-a008-7f12c84f96db



### Getting Started
1. Download from [reorproject.org](https://reorproject.org). Mac, Linux & Windows are all supported.
2. Install like a normal App.


### Running local models
Reor interacts directly with [Llama.cpp](https://github.com/ggerganov/llama.cpp) libraries so there's no need to download Ollama. Although right now, we don't download models for you so you'll need to download your model of choice manually:
1. Download a GGUF model file. [HuggingFace](https://huggingface.co/models?sort=downloads&search=gguf) has this nice page with the most popular models. I recommend starting with a 7B 4-bit model and see how that performs on your system.
2. Connect it in Reor settings under "Add a new local model".

And if you so please, you can also use OpenAI models via your own API key...

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

## License
GPL-3.0 license. See `LICENSE` for details.

*Reor means "to think" in Latin.*
