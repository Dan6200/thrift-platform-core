import { MediaRepository } from '../ports/media-repository.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const getAvatarUseCase =
  (mediaUrl: MediaUrl, repository: MediaRepository) => async (userId: string) =>
    withMediaUrl(await repository.getAvatar(userId), mediaUrl)
