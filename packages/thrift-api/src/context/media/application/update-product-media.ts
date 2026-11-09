import { MediaRepository } from '../ports/media-repository.js'
import { MediaStorage, RawUpload } from '../ports/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const updateProductMediaUseCase =
  (storage: MediaStorage, mediaUrl: MediaUrl, repository: MediaRepository) =>
  async (input: {
    mediaId: number
    file?: RawUpload
    description?: string
    filetype?: string
  }) => {
    let stored
    if (input.file) {
      stored = await storage.upload(input.file, 'products')
    }
    const media = await repository.updateProductMedia({
      mediaId: input.mediaId,
      file: stored
        ? { filename: stored.filename, filetype: stored.filetype }
        : undefined,
      description: input.description,
      filetype: input.filetype,
    })
    return withMediaUrl(media, mediaUrl)
  }
