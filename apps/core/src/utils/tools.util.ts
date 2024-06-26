import crypto from 'crypto'

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const md5 = (text: string) =>
  crypto.createHash('md5').update(text).digest('hex') as string

export function getAvatar(mail: string | undefined) {
  if (!mail) {
    return ''
  }
  return `https://cravatar.cn/avatar/${md5(mail)}?d=retro`
}

export const camelcaseKey = (key: string) =>
  key.replace(/_(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))

export const camelcaseKeys = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(camelcaseKeys)
  }
  const n: any = {}
  Object.keys(obj).forEach((k) => {
    n[camelcaseKey(k)] = camelcaseKeys(obj[k])
  })
  return n
}

/**
 * hash string
 */
export const hashString = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}
