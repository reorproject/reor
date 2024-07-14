import { Readable } from 'stream'

import { net } from 'electron'
import { ClientRequestConstructorOptions } from 'electron/main'

export const customFetchUsingElectronNet = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  console.log('input: ', input)
  console.log('init: ', init)
  const url = input instanceof URL ? input.href : input.toString()
  const options = init || {}

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method || 'GET',
      url,
    }

    const request = net.request(requestOptions)

    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        request.setHeader(key, value as string)
      })
    }

    // Handle request body
    if (options.body) {
      let bodyData
      if (options.body instanceof ArrayBuffer) {
        bodyData = Buffer.from(options.body)
      } else if (typeof options.body === 'string' || Buffer.isBuffer(options.body)) {
        bodyData = options.body
      } else if (typeof options.body === 'object') {
        bodyData = JSON.stringify(options.body)
        request.setHeader('Content-Type', 'application/json')
      } else {
        reject(new Error('Unsupported body type'))
        return
      }
      request.write(bodyData)
    }

    request.on('response', (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk as Buffer))
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(
          new Response(buffer, {
            status: response.statusCode,
            statusText: response.statusMessage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            headers: new Headers(response.headers as any),
          }),
        )
      })
    })

    request.on('error', (error) => reject(error))
    request.end()
  })
}

export const customFetchUsingElectronNetStreaming = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = input instanceof URL ? input.href : input.toString()
  const options = init || {}

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method || 'GET',
      url,
    }

    // Ignore the 'agent' property from 'init' as it's not relevant for Electron's net module
    if ('agent' in options) {
      delete options.agent
    }

    const request = net.request(requestOptions)

    // Set headers, except for 'content-length' which will be set automatically
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-length') {
          // Skip 'content-length'
          request.setHeader(key, value as string)
        }
      })
    }

    // Handle request body
    if (options.body) {
      let bodyData
      if (options.body instanceof ArrayBuffer) {
        bodyData = Buffer.from(options.body)
      } else if (typeof options.body === 'string' || Buffer.isBuffer(options.body)) {
        bodyData = options.body
      } else if (typeof options.body === 'object') {
        bodyData = JSON.stringify(options.body)
        request.setHeader('Content-Type', 'application/json')
      } else {
        reject(new Error('Unsupported body type'))
        return
      }
      request.write(bodyData)
    }

    request.on('response', (response) => {
      const nodeStream = new Readable({
        read() {},
      })

      response.on('data', (chunk) => {
        nodeStream.push(chunk)
      })

      response.on('end', () => {
        nodeStream.push(null) // Signal end of stream
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.on('error', (error: any) => {
        nodeStream.destroy(error) // Handle stream errors
      })

      const webStream = nodeToWebStream(nodeStream)

      resolve(
        new Response(webStream, {
          status: response.statusCode,
          statusText: response.statusMessage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          headers: new Headers(response.headers as any),
        }),
      )
    })

    request.on('error', (error) => {
      reject(error)
    })

    request.end()
  })
}

function nodeToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  let isStreamEnded = false

  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        if (!isStreamEnded) {
          controller.enqueue(chunk instanceof Buffer ? new Uint8Array(chunk) : chunk)
        }
      })

      nodeStream.on('end', () => {
        if (!isStreamEnded) {
          isStreamEnded = true
          controller.close()
        }
      })

      nodeStream.on('error', (err) => {
        if (!isStreamEnded) {
          isStreamEnded = true
          controller.error(err)
        }
      })
    },
    cancel(reason) {
      // Handle any cleanup or abort logic here
      nodeStream.destroy(reason)
    },
  })

  return webStream
}
