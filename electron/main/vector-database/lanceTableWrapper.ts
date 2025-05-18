import { Connection, Table as LanceDBTable, MetricType, makeArrowTable } from 'vectordb'
import { EmbeddingModelConfig } from '../electron-store/storeConfig'

import { EnhancedEmbeddingFunction, createEmbeddingFunction } from './embeddings'
import GetOrCreateLanceTable from './lance'
import { DBEntry, DBQueryResult, DatabaseFields } from './schema'

export function unsanitizePathForFileSystem(dbPath: string): string {
  return dbPath.replace(/''/g, "'")
}

export function convertRecordToDBType<T extends DBEntry | DBQueryResult>(record: Record<string, unknown>): T | null {
  const { vector, ...recordWithoutVector } = record
  const recordWithType = recordWithoutVector as unknown as T
  recordWithType.notepath = unsanitizePathForFileSystem(recordWithType.notepath)
  return recordWithType
}

export function sanitizePathForDatabase(filePath: string): string {
  return filePath.replace(/'/g, "''")
}

class LanceDBTableWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lanceTable!: LanceDBTable<any>

  private embedFun!: EnhancedEmbeddingFunction<string | number[]>

  async initialize(dbConnection: Connection, userDirectory: string, embeddingModelConfig: EmbeddingModelConfig) {
    this.embedFun = await createEmbeddingFunction(embeddingModelConfig, 'content')

    this.lanceTable = await GetOrCreateLanceTable(dbConnection, this.embedFun, userDirectory)
  }

  async add(_data: DBEntry[], onProgress?: (progress: number) => void): Promise<void> {
    const data = _data
      .filter((x) => x.content !== '')
      .map((_x) => {
        const x = _x
        x.notepath = sanitizePathForDatabase(x.notepath)
        return x
      })

    // clean up previously indexed entries and reindex the whole file
    await this.deleteDBItemsByFilePaths(data.map((x) => x.notepath))

    const recordEntry: Record<string, unknown>[] = data as unknown as Record<string, unknown>[]
    const numberOfChunksToIndexAtOnce = process.platform === 'darwin' ? 50 : 40
    const chunks = []
    for (let i = 0; i < recordEntry.length; i += numberOfChunksToIndexAtOnce) {
      chunks.push(recordEntry.slice(i, i + numberOfChunksToIndexAtOnce))
    }

    if (chunks.length === 0) return

    const totalChunks = chunks.length

    await chunks.reduce(async (previousPromise, chunk, index) => {
      await previousPromise
      const arrowTableOfChunk = makeArrowTable(chunk)
      await this.lanceTable.add(arrowTableOfChunk)
      const progress = (index + 1) / totalChunks
      if (onProgress) {
        onProgress(progress)
      }
    }, Promise.resolve())
  }

  async deleteDBItemsByFilePaths(filePaths: string[]): Promise<void> {
    const quotedFilePaths = filePaths
      .map((filePath) => sanitizePathForDatabase(filePath))
      .map((filePath) => `'${filePath}'`)
      .join(', ')
    if (quotedFilePaths === '') {
      return
    }
    const filterString = `${DatabaseFields.NOTE_PATH} IN (${quotedFilePaths})`
    try {
      await this.lanceTable.delete(filterString)
    } catch (error) {
      //  no need to throw error
    }
  }

  async updateDBItemsWithNewFilePath(oldFilePath: string, newFilePath: string): Promise<void> {
    const sanitizedFilePath = sanitizePathForDatabase(oldFilePath)
    if (sanitizedFilePath === '') {
      return
    }
    const filterString = `${DatabaseFields.NOTE_PATH} = '${sanitizedFilePath}'`
    try {
      await this.lanceTable.update({
        where: filterString,
        values: {
          [DatabaseFields.NOTE_PATH]: sanitizePathForDatabase(newFilePath),
        },
      })
    } catch (error) {
      // no need to throw error
    }
  }

  async search(query: string, limit: number, filter?: string): Promise<DBQueryResult[]> {
    const lanceQuery = this.lanceTable.search(query).metricType(MetricType.Cosine).limit(limit)

    if (filter) {
      lanceQuery.prefilter(true)
      lanceQuery.filter(filter)
    }
    const rawResults = await lanceQuery.execute()
    const mapped = rawResults.map(convertRecordToDBType<DBQueryResult>)
    return mapped as DBQueryResult[]
  }

  async filter(filterString: string, limit: number = 10): Promise<DBEntry[]> {
    const rawResults = await this.lanceTable.filter(filterString).limit(limit).execute()
    const mapped = rawResults.map(convertRecordToDBType<DBEntry>)
    return mapped as DBEntry[]
  }
}

export default LanceDBTableWrapper
