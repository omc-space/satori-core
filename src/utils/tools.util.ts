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
