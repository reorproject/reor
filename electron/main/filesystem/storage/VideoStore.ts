/**
 * VideoStore.ts
 * ---------------
 *
 * We want to store videos in the appData directory in electron. We also want to ensure
 * that each video is only stored once, and that we can reference the same video in multiple
 * places without duplicating it.
 *
 * We maintain metadata about each video including the original filename and creation date. Since this app is locally
 *  ran, each image path will exist on the user's disk (upload) or on the cloud (embed).
 */
import { MediaStore } from './MediaStore'

class VideoStore extends MediaStore {
  constructor(appDataPath: string) {
    super(appDataPath, 'videos')
  }

  getMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:video\/([a-zA-Z0-9-.+]+);base64,/)
    return match ? `video/${match[1]}` : 'video/mp4'
  }
}

export default VideoStore
