import { MediaUrl } from '../ports/media-url.js'

const attach = (value: unknown, mediaUrl: MediaUrl): unknown => {
  if (Array.isArray(value)) return value.map((item) => attach(item, mediaUrl))
  if (value && typeof value === 'object' && 'filename' in value) {
    const media = value as { filename: string; filetype?: string }
    return {
      ...value,
      filepath: mediaUrl.url(media.filename, media.filetype),
    }
  }
  return value
}

/**
 * Media rows only store the filename/public_id; the delivery URL is derived on
 * read so delivery configuration can change without a data migration.
 */
export const withMediaUrl = (value: unknown, mediaUrl: MediaUrl): unknown =>
  attach(value, mediaUrl)
