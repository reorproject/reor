<h1 align="center"> Reor Project </h1>

<h4 align="center">
   A local-first AI personal knowledge management app.
</h4>

## Hypotheses
- AI should be used not just for to edit and generate writing, it should be used primarily to organise unstructured bits of writing.
- Every note or piece of text should be embedded into a feature space.
- Composing new ideas is greatly enhanced by viewing similar ideas from the past.
- Models should be run on the end user machine, OpenAI should not be sent an entire corpus of _private_ notes.
- Open source models will surpass proprietary ones, particularly in specialised usecases such as developing queries or generating knowledge graphs (link to paper)

## Features
- Chat with your notes
- Similarity sidebar - see the most similar notes right from the markdown editor
- WYSIWYG markdown editor
- Notes and vectordb stored locally. Your notes are your notes


## Other points
- Powered under the hood by [lancedb](https://github.com/lancedb/lancedb) for extremely low memory usage!
- Fully electron, so no Python or manual setup. Just download it in the releases tab


(Still in early beta, but hey they say release early!)
