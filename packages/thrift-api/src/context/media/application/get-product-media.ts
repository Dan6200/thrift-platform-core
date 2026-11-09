import { MediaRepository } from '../ports/media-repository.js'
import { MediaUrl } from '../ports/media-url.js'
import { withMediaUrl } from './with-media-url.js'

export const getProductMediaUseCase =
  (mediaUrl: MediaUrl, repository: MediaRepository) =>
  async (mediaId: number) =>
    withMediaUrl(await repository.getProductMedia(mediaId), mediaUrl)
