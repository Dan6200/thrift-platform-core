import { MediaRepository } from '../ports/media-repository.js'
import { MediaStorage, RawUpload } from '../ports/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const updateAvatarUseCase =
  (storage: MediaStorage, mediaUrl: MediaUrl, repository: MediaRepository) =>
  async (input: { userId: string; file?: RawUpload; description?: string }) => {
    let stored
    if (input.file) {
      stored = await storage.upload(input.file, 'avatars')
    }
    const media = await repository.updateAvatar({
      userId: input.userId,
      file: stored
        ? {
            filename: stored.filename,
            filetype: stored.filetype,
          }
        : undefined,
      description: input.description,
    })
    return withMediaUrl(media, mediaUrl)
  }
