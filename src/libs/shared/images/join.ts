import sharp from 'sharp'

export const joinImages = async (images: readonly Buffer[]) => {
  const withMeta = await Promise.all(
    images.map(async image => {
      const meta = await sharp(image).metadata()

      return {
        meta,
        image: sharp(image),
      }
    }),
  )

  const maxWidth = Math.max(...withMeta.map(x => x.meta.width ?? 0)) / 4
  const maxHeight = Math.max(...withMeta.map(x => x.meta.height ?? 0)) / 4

  const rows = Math.ceil(Math.sqrt(images.length))
  const cols = Math.ceil(images.length / rows)

  const outputWidth = maxWidth * cols
  const outputHeight = maxHeight * rows

  const blankImage = sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })

  const composites = await Promise.all(
    withMeta.map(async (image, i) => {
      const xPos = (i % cols) * maxWidth
      const yPos = Math.floor(i / cols) * maxHeight

      return {
        input: await image.image.resize(maxWidth, maxHeight).toBuffer(),
        top: yPos,
        left: xPos,
      }
    }),
  )

  return blankImage.composite(composites).png().toBuffer()
}
