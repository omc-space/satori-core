import { marked } from 'marked'
import getColors from 'get-image-colors'
import axios from 'axios'
import imageSize from 'image-size'
import { ImageModel } from '~/shared/model/image.model'

export const pickImagesFromMarkdown = (text: string) => {
  const ast = marked.lexer(text)
  const images = [] as string[]
  function pickImage(node: any) {
    if (node.type === 'image') {
      images.push(node.href)
      return
    }
    if (node.tokens && Array.isArray(node.tokens)) {
      return node.tokens.forEach(pickImage)
    }
  }
  ast.forEach(pickImage)
  return images
}
const reg = /w_(\d+)x(\d+)_/
export function getImageSizeFromUrl(url: string) {
  const m = reg.exec(url)
  if (m && m[1] && m[2]) {
    return {
      width: Number(m[1]),
      height: Number(m[2]),
    }
  }
  return null
}

export async function getAverageRGB(
  buffer: Buffer,
  type: string,
): Promise<string | undefined> {
  if (!buffer) {
    return undefined
  }

  try {
    // NOTE: can not pass image url here, because request package is removed manually.
    const colors = await getColors(buffer, type)

    return colors[0].hex()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.message)
    return undefined
  }
}

export async function getOnlineImageSizeAndMeta(url: string) {
  const { data, headers } = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    },
  })

  const imageType = headers['content-type']!

  const buffer = Buffer.from(data)
  const size = imageSize(buffer)

  // get accent color
  const accent = await getAverageRGB(buffer, imageType)

  return { size, accent }
}

function setsAreEqual(a, b) {
  if (a.size !== b.size) {
    return false
  }

  return Array.from(a).every((element) => {
    return b.has(element)
  })
}

export async function getImageMetaFromMd(
  text: string,
  originImages?: ImageModel[],
) {
  const urls = await pickImagesFromMarkdown(text)
  if (originImages) {
    const origin = new Set(originImages.map((i) => i.src))
    const newImages = new Set(urls)
    if (setsAreEqual(origin, newImages)) {
      return originImages
    }
  }
  const images = []
  for (const url of urls) {
    const image = {
      src: url,
      width: 0,
      height: 0,
      accent: '',
    }
    const imageSize = getImageSizeFromUrl(url)
    if (!imageSize) {
      const res = await getOnlineImageSizeAndMeta(url)
      image.width = res.size.width
      image.height = res.size.height
      image.accent = res.accent
    }
    image.width = imageSize.width
    image.height = imageSize.height
    images.push(image)
  }
  return images
}
