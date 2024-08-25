import { net } from 'electron'
import { ClientRequestConstructorOptions } from 'electron/main'

const customFetchUsingElectronNet = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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

export default customFetchUsingElectronNet
