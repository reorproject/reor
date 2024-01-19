<h1 align="center">Reor Project</h1>
<!-- <p align="center">
    <img src="logo_or_graphic_representation.png" alt="Reor Logo">
</p> -->

<h4 align="center">
AI second brain & personal knowledge management app. </h4>

<p align="center">
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-GPLv3-blue.svg"></a>
<img alt="GitHub Release Date - Published_At" src="https://img.shields.io/github/release-date/reorproject/reor">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/reorproject/reor">

</p>
<!-- <img width="1342" alt="Screenshot 2024-01-10 at 18 43 31" src="https://github.com/reorproject/reor/assets/17236551/336ff84d-cecc-44de-bd92-57ff61579dea"> -->
<!-- <img width="1203" alt="Screenshot 2024-01-10 at 18 24 55" src="https://github.com/reorproject/reor/assets/17236551/cde5ab19-b394-459e-8657-bfc4f204014f"> -->
<!-- <img width="1202" alt="Screenshot 2024-01-10 at 18 50 03" src="https://github.com/reorproject/reor/assets/17236551/c85fdc6b-057f-4693-829a-d0e45da6113e"> -->
<!-- <img width="1200" alt="Screenshot 2024-01-10 at 18 54 02" src="https://github.com/reorproject/reor/assets/17236551/e6d3b7af-d3f4-4ffe-a2a6-f4682beaff06"> -->


## About
**The Reor Project** is a personal knowledge management tool that automatically manages your knowledge with AI: It connects together related ideas, provides semantic search and answers questions with the full context of the knowledge base. You can edit your knowledge base with an Obsidian-like WYSIWYG markdown editor. 

Reor was built right from the very start to be able to **run models locally**. We believe running models locally *(and privately)* is essential: no one entity should be able to control the world's first artificially intelligent systems, nor your personal thoughts no matter how "open" they are. 

![reor](https://github.com/reorproject/reor/assets/17236551/cf743f16-fe5d-4099-bc08-74b8c76709c4)


### Getting Started
1. Download from [reorproject.org](https://reorproject.org). Mac, Linux & Windows are all supported.
2. Install like a normal App.

### Extra Linux packages:
Strangely, Linux causes some package issues with regards to Transformers.js (the library we use for embeddings). So you may need to install the following packages: "fuse", "libfuse2", "libvips". On Ubuntu:
```
sudo apt update
sudo apt install fuse libfuse2 libvips
```

### Importing from other apps
Reor works within a single directory in the filesystem. You choose the directory on first boot.
To import notes/files from another app, you'll need to populate that directory manually with markdown files. Integrations with other apps are hopefully coming soon!


### Beta Phase
The Reor Project is in currently in beta. And almost ready for stable release! Of course, it won't be as bug-free right now as something like Obsidian. But I am working as hard as I can to make this as good of an experience as can be! Feedback and support are welcome on our [Issues](https://github.com/reor-project/issues) page.

## License
GPL-3.0 license. See `LICENSE` for details.

*Reor means "to think" in Latin.*
