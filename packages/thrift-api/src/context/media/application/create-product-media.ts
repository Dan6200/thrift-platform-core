import { MediaRepository } from '../ports/media-repository.js'
import { MediaStorage, RawUpload } from '../ports/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const createProductMediaUseCase =
  (storage: MediaStorage, mediaUrl: MediaUrl, repository: MediaRepository) =>
  async (input: {
    userId: string
    productId: number
    files: RawUpload[]
    descriptions: Record<string, string>
    isDisplayImage: Record<string, boolean>
    isThumbnailImage: Record<string, boolean>
    filetypes: Record<string, string>
  }) => {
    const storedFiles = await Promise.all(
      input.files.map((file) => storage.upload(file, 'products')),
    )

    const mediaFiles = storedFiles.map((stored, index) => ({
      filename: stored.filename,
      filetype: stored.filetype,
      originalname: input.files[index].originalname,
    }))

    const media = await repository.createProductMedia({
      userId: input.userId,
      productId: input.productId,
      files: mediaFiles,
      descriptions: input.descriptions,
      isDisplayImage: input.isDisplayImage,
      isThumbnailImage: input.isThumbnailImage,
      filetypes: input.filetypes,
    })
    return withMediaUrl(media, mediaUrl)
  }
