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
