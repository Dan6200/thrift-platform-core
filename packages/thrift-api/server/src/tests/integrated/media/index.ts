//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductMediaUpload } from '#src/types/products/index.js'
import testProductMedia from './products/index.js'
import testAvatar from './avatar/index.js' // Import testCreateAvatar from new location
import * as Aliyu from '../data/users/vendors/user-aliyu/index.js'
import { bulkDeleteImages } from '../utils/bulk-delete.js'

export default function (user: {
  userInfo: ProfileRequestData
  productMedia?: ProductMediaUpload[][]
}) {
  before(async () => await bulkDeleteImages('avatars'))

  describe('Testing Avatar Creation', () => testAvatar(user))
  if (user.productMedia) {
    describe('Testing Media Creation', () =>
      testProductMedia(user as typeof Aliyu))
  }

  after(async () => bulkDeleteImages('avatars'))
}
