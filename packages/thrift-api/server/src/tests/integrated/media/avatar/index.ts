//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import { testCreateAvatar } from '../../profiles/definitions/index.js'
import { bulkDeleteImages } from '../../utils/bulk-delete.js'
import { deleteUserForTesting } from '../../helpers/delete-user.js'
import { createUserForTesting } from '../../helpers/create-user.js'
import { signInForTesting } from '../../helpers/signin-user.js'

// globals
const avatarMediaRoute = '/v1/media/avatar'
const server: string = process.env.SERVER!

export default function ({ userInfo }: { userInfo: ProfileRequestData }) {
  let token: string
  let userId: string

  before(async () => {
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)
    await bulkDeleteImages('avatars')
  })

  it('it should upload an avatar for the user', async () => {
    const avatarMedia = {
      filename: 'avatar.jpg',
      path: './server/src/tests/integrated/data/users/vendors/user-aliyu/profile/avatar.jpg',
      description: 'User avatar',
      filetype: 'image/jpeg',
    }
    await testCreateAvatar(server, avatarMediaRoute, avatarMedia, token)
  })

  after(async () => {
    await deleteUserForTesting(userId)
    await bulkDeleteImages('avatars')
  })
}
