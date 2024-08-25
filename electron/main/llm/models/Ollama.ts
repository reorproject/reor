/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from 'child_process'
import * as os from 'os'
import * as path from 'path'

import { app } from 'electron'
import { LLM, LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import { Tiktoken, TiktokenModel, encodingForModel } from 'js-tiktoken'
import { ModelResponse, ProgressResponse, Ollama } from 'ollama'

const OllamaServeType = {
  SYSTEM: 'system', // ollama is installed on the system
  PACKAGED: 'packaged', // ollama is packaged with the app
}

export const defaultOllamaAPI: LLMAPIConfig = {
  name: 'Ollama',
  apiInterface: 'openai',
  apiURL: 'http://localhost:11434/v1/',
}

class OllamaService {
  private client!: Ollama

  private host = 'http://127.0.0.1:11434'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private childProcess: any

  public init = async () => {
    // add ollama to store if it doesn't alreay exist: store.set(StoreKeys.LLMAPIs, [defaultOllamaAPI])
    const currentAPIs = await this.serve()

    const ollamaLib = await import('ollama')
    this.client = new ollamaLib.Ollama()

    // const models = await this.client.default.list();
    // ;
    // const lists = await this.client.
    // ;
  }

  async ping() {
    const response = await fetch(this.host, {
      method: 'GET',
      cache: 'no-store',
    })

    if (response.status !== 200) {
      throw new Error(`failed to ping ollama server: ${response.status}`)
    }

    return true
  }

  async serve() {
    try {
      // see if ollama is already running
      await this.ping()
      return OllamaServeType.SYSTEM
    } catch (err) {
      // this is fine, we just need to start ollama
    }

    try {
      // See if 'ollama serve' command is available on the system
      await this.execServe('ollama')

      return OllamaServeType.SYSTEM
    } catch (err) {
      // ollama is not installed, run the binary directly
      // logInfo(`/ is not installed on the system: ${err}`);
    }

    let exeName = ''
    let exeDir = ''
    switch (process.platform) {
      case 'win32':
        exeName = 'ollama-windows-amd64.exe'
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, 'binaries')
          : path.join(app.getAppPath(), 'binaries', 'win32')

        break
      case 'darwin':
        exeName = 'ollama-darwin'
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, 'binaries')
          : path.join(app.getAppPath(), 'binaries', 'darwin')
        break
      case 'linux':
        exeName = 'ollama-linux-amd64'
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, 'binaries')
          : path.join(app.getAppPath(), 'binaries', 'linux')

        break
      default:
        throw new Error('Unsupported platform')
    }
    const exePath = path.join(exeDir, exeName)
    try {
      await this.execServe(exePath)
      return OllamaServeType.PACKAGED
    } catch (err) {
      throw new Error(`Failed to start Ollama: ${err}`)
    }
  }

  async execServe(_path: string) {
    return new Promise((resolve, reject) => {
      const env = { ...process.env }
      const command = `"${_path}" serve`

      this.childProcess = exec(command, { env }, (err, stdout, stderr) => {
        if (err) {
          reject(`exec error: ${err}`)
          return
        }

        if (stderr) {
          reject(`ollama stderr: ${stderr}`)
          return
        }

        reject(`ollama stdout: ${stdout}`)
      })

      // Once the process is started, try to ping Ollama server.
      this.waitForPing()
        .then(() => {
          resolve(undefined)
        })
        .catch((pingError) => {
          if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill()
          }
          reject(pingError)
        })
    })
  }

  async waitForPing(delay = 1000, retries = 20) {
    for (let i = 0; i < retries; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.ping()
        return
      } catch (err) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, delay)
        })
      }
    }
    throw new Error("Max retries reached. Ollama server didn't respond.")
  }

  stop() {
    if (!this.childProcess) {
      return
    }

    if (os.platform() === 'win32') {
      exec(`taskkill /pid ${this.childProcess.pid} /f /t`)
    } else {
      this.childProcess.kill()
    }

    this.childProcess = null
  }

  public getAvailableModels = async (): Promise<LLM[]> => {
    const ollamaModelsResponse = await this.client.list()

    const output = ollamaModelsResponse.models.map(
      (model: ModelResponse): LLM => ({
        modelName: model.name,
        contextLength: 4096,
        apiName: defaultOllamaAPI.name,
      }),
    )
    return output
  }

  public pullModel = async (modelName: string, handleProgress: (chunk: ProgressResponse) => void): Promise<void> => {
    const stream = await this.client.pull({
      model: modelName,
      stream: true,
    })
    for await (const progress of stream) {
      handleProgress(progress)
    }
  }

  public deleteModel = async (modelName: string): Promise<void> => {
    await this.client.delete({ model: modelName })
  }

  public getTokenizer = (llmName: string): ((text: string) => number[]) => {
    let tokenEncoding: Tiktoken
    try {
      tokenEncoding = encodingForModel(llmName as TiktokenModel)
    } catch (e) {
      tokenEncoding = encodingForModel('gpt-3.5-turbo-1106') // hack while we think about what to do with custom remote models' tokenizers
    }
    const tokenize = (text: string): number[] => tokenEncoding.encode(text)
    return tokenize
  }

  public abort(): void {
    throw new Error('Abort not yet implemented.')
  }
}

export default OllamaService
