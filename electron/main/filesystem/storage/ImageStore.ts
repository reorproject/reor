/**
 * ImageStore.ts
 * ---------------
 *
 * We want to store images in the appData directory in electron. We also want to ensure
 * that each image is only stored once, and that we can reference the same image in multiple
 * places without duplicating the image.
 *
 * We maintain metadata about each image including the original filename and creation date. Since this app is locally
 *  ran, each image path will exist on the user's disk (upload) or on the cloud (embed).
 */
import MediaStore from './MediaStore'

class ImageStore extends MediaStore {
  constructor(appDataPath: string) {
    super(appDataPath, 'images')
  }
}

export default ImageStore
