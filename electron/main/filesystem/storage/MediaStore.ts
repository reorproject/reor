/**
 * MediaStore.ts
 * ---------------
 *
 * Generic class to store media in the appData directoory in electron.
 * This application requires an ImageStore and a VideoStore which calls
 * the appropriate methods.
 */
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

interface FileType {
  ext: string
  mime: string
}

export class MediaStore {
  protected storageDir: string
  protected metadataFile: string
  protected mediaType: string

  constructor(appDataPath: string, mediaType: string) {
    this.storageDir = path.join(appDataPath, mediaType)
    this.metadataFile = path.join(appDataPath, `${mediaType}Metadata.json`)
    this.mediaType = mediaType
    this.initStorage()
  }

  protected initStorage(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }
    if (!fs.existsSync(this.metadataFile)) {
      fs.writeFileSync(this.metadataFile, JSON.stringify({}))
    }
  }

  protected getMetadata(): Record<string, MediaMetadata> {
    const data = fs.readFileSync(this.metadataFile, 'utf8')
    return JSON.parse(data)
  }

  protected saveMetadata(metadata: Record<string, MediaMetadata>): void {
    fs.writeFileSync(this.metadataFile, JSON.stringify(metadata))
  }

  protected generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const hash = crypto.createHash('md5').update(`${originalName}${timestamp}`).digest('hex')
    return hash
  }

  protected async checkFileType(buffer: any): Promise<FileType | undefined> {
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(buffer)
    return type
  }

  protected validateFileType(mimeType: string): boolean {
    return this.mediaType === 'images'
      ? ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'].includes(mimeType)
      : ['video/mp4', 'video/webm', 'video/quicktime'].includes(mimeType)
  }

  public async storeMedia(mediaData: string, originalName: string, blockId: string): Promise<string> {
    try {
      const base64Data = mediaData.replace(/^data:[^;]+;base64,/, '')
      const buffer: any = Buffer.from(base64Data, 'base64')

      const type = await this.checkFileType(buffer)
      if (!type || !this.validateFileType(type.mime)) {
        throw new Error(`Invalid ${this.mediaType.slice(0, -1)} file type`)
      }

      const fileName = `${this.generateFileName(originalName)}.${type.ext}`
      const filePath = path.join(this.storageDir, fileName)

      await fs.promises.writeFile(filePath, buffer)

      const metadata = this.getMetadata()
      metadata[blockId] = {
        id: blockId,
        fileName,
        originalName,
        mimeType: type.mime,
        createdAt: new Date().toISOString(),
        fileSize: buffer.length,
      }
      this.saveMetadata(metadata)
      return `local://${fileName}`
    } catch (error) {
      console.error(`Error storing ${this.mediaType.slice(0, -1)}:`, error)
      throw error
    }
  }

  public async getMedia(fileName: string): Promise<string | null> {
    try {
      const updatedFileName = fileName.replace('local://', '')
      const filePath = path.join(this.storageDir, updatedFileName)
      if (!fs.existsSync(filePath)) return null

      const buffer = await fs.promises.readFile(filePath)
      const type = await this.checkFileType(buffer)

      if (!type || !this.validateFileType(type.mime)) {
        throw new Error(`Invalid ${this.mediaType.slice(0, -1)} file type`)
      }

      return `data:${type.mime};base64,${buffer.toString('base64')}`
    } catch (error) {
      console.error(`Error retrieving ${this.mediaType.slice(0, -1)}:`, error)
      return null
    }
  }

  public getFileType(fileName: string): string | null {
    const mimeType = path.extname(fileName).toLowerCase()

    switch (mimeType) {
      case '.png':
        return 'image/png'
      case '.jpg':
        return 'image/jpeg'
      case '.jpeg':
        return 'image/jpeg'
      case '.gif':
        return 'image/gif'
      case '.svg':
        return 'image/svg+xml'
      case '.mp4':
        return 'video/mp4'
      case '.webm':
        return 'video/webm'
      default:
        return null
    }
  }

  public getMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)
    return match ? match[1] : 'application/octet-stream'
  }
}
