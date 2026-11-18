import { MediaUrl } from '../ports/media-url.js'

export const withMediaUrl = async (
  value: unknown,
  mediaUrl: MediaUrl,
  folder: 'products' | 'avatars' = 'products',
): Promise<unknown> => {
  if (Array.isArray(value))
    return Promise.all(
      value.map((item) => withMediaUrl(item, mediaUrl, folder)),
    )
  if (value && typeof value === 'object' && 'filename' in value) {
    const media = value as { filename: string; filetype?: string }
    return {
      ...value,
      filepath: await mediaUrl.url(media.filename, media.filetype, folder),
    }
  }
  return value
}
