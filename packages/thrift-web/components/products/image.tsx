//cspell:ignore CldImage, cloudinary, cloudinary's, unoptimized
'use client'
import { CldImage } from 'next-cloudinary'
import { ImgData } from '@/types/products'

export function ProductImage({
  className,
  imgData,
  width,
  height,
}: {
  className: string
  width: number
  height: number
  imgData: ImgData | undefined
}) {
  if (imgData?.filepath) {
    const src = imgData.filepath
    const alt = imgData.description
    // Note explicitly setting version is not necessary
    return (
      <CldImage
        {...{ src, alt, className, width, height }}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    )
  }
  return <p>Failed to Load Image</p>
}
