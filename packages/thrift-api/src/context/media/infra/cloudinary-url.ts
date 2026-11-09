import { cloudinary } from '#src/utils/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'

const cloudinaryUrl: MediaUrl = {
  url(filename, filetype) {
    return cloudinary.url(filename, {
      secure: true,
      resource_type: filetype?.startsWith('video/') ? 'video' : 'image',
    })
  },
}

/**
 * Test double: integration tests must not depend on Cloudinary. The URL shape
 * is deterministic so tests can assert that responses derive (not store) it.
 */
const testUrl: MediaUrl = {
  url(filename) {
    return `https://test.invalid/${filename}`
  },
}

export const cloudinaryMediaUrl: MediaUrl =
  process.env.NODE_ENV === 'testing' ? testUrl : cloudinaryUrl
