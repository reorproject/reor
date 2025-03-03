export const HYPERMEDIA_SCHEME = 'hm'

export function isHypermediaScheme(url?: string) {
  return !!url?.startsWith(`${HYPERMEDIA_SCHEME}://`)
}
