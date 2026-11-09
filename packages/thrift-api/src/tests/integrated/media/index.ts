//cspell:ignore cloudinary
import chai from 'chai'
import { knex } from '#src/db/index.js'
import { ProfileRequestData } from '../../types/profile/index.js'
import { ProductMediaUpload } from '../../types/products.js'
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

  describe('Media URLs', () => {
    it('does not store filepath on the media table', async () => {
      const { rows } = await knex.raw(
        `select column_name from information_schema.columns
         where table_name = 'media' and column_name = 'filepath'`,
      )
      chai.expect(rows.length).to.equal(0)
    })
  })
}
