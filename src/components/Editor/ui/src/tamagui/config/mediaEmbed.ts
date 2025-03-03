import { CiImageOn, CiVideoOn } from 'react-icons/ci'
// import { LuAudioLines } from "react-icons/lu";

const mediaConfig = {
  image: {
    mediaType: 'image',
    icon: CiImageOn,
    hint: 'Add an Image',
    uploadOptionHint: 'Upload Image',
    embedPlaceholder: 'Paste your link here...',
    embedOptionHint: 'Embed Link',
  },
  video: {
    mediaType: 'video',
    icon: CiVideoOn,
    hint: 'Add a Video',
    uploadOptionHint: 'Upload Video',
    embedPlaceholder: 'Paste your link here...',
    embedOptionHint: 'Embed Video',
  },
  // audio: {
  //   icon: LuAudioLines,
  //   hint: "Add an audio file",
  //   uploadOptionHint: "Upload Audio File",
  //   embedPlaceholder: "Paste your link here...",
  //   embedOptionHint: "Embed Audio",
  // }
}

export default mediaConfig
