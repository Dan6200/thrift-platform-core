//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductMediaUpload } from '#src/types/products/index.js'
import testProductMedia from './products/index.js'
import testAvatar from './avatar/index.js' // Import testCreateAvatar from new location

export default function (user: {
  userInfo: ProfileRequestData
  productMedia?: ProductMediaUpload[][]
}) {
  describe('Testing Avatar Creation', () => testAvatar(user))
  if (user.userInfo.is_vendor) {
    describe('Testing Media Creation', () => testProductMedia(user as any))
  }
}
