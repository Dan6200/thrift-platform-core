import { cloudinary } from '#src/utils/media-storage.js'
import { MediaUrl } from '../ports/media-url.js'

import { createConfiguredMediaUrl } from './configured-media-url.js'
import { readMediaFolderPrefix } from './media-folder.js'

const cloudinaryUrl = createConfiguredMediaUrl(
  readMediaFolderPrefix,
  (publicId, resourceType) =>
    cloudinary.url(publicId, { secure: true, resource_type: resourceType }),
)

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
