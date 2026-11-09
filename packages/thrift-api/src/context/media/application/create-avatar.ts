import { MediaRepository } from '../ports/media-repository.js'
import { MediaStorage, RawUpload } from '../ports/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const createAvatarUseCase =
  (storage: MediaStorage, mediaUrl: MediaUrl, repository: MediaRepository) =>
  async (input: { userId: string; file: RawUpload; description?: string }) => {
    const stored = await storage.upload(input.file, 'avatars')
    const media = await repository.createAvatar({
      userId: input.userId,
      file: {
        filename: stored.filename,
        filetype: stored.filetype,
      },
      description: input.description,
    })
    return withMediaUrl(media, mediaUrl)
  }
