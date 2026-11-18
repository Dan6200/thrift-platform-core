import { MediaUrl } from '../ports/media-url.js'

export const createConfiguredMediaUrl = (
  readPrefix: () => Promise<string>,
  buildUrl: (publicId: string, resourceType: 'image' | 'video') => string,
): MediaUrl => ({
  async url(filename, filetype, folder = 'products') {
    const publicId = filename.includes('/')
      ? filename
      : [(await readPrefix()).replace(/^\/+|\/+$/g, ''), folder, filename]
          .filter(Boolean)
          .join('/')
    return buildUrl(
      publicId,
      filetype?.startsWith('video/') ? 'video' : 'image',
    )
  },
})
