import { expect } from 'chai'
import { createConfiguredMediaUrl } from '../../../context/media/infra/configured-media-url.js'

export default () => {
  it('resolves bare filenames using the current prefix and media folder', async () => {
    let prefix = 'sellit-media/'
    const urls = createConfiguredMediaUrl(
      async () => prefix,
      (id) => `https://cdn.test/${id}`,
    )
    expect(await urls.url('dress.png', 'image/png', 'products')).to.equal(
      'https://cdn.test/sellit-media/products/dress.png',
    )
    prefix = '/new-media//'
    expect(await urls.url('avatar.png', 'image/png', 'avatars')).to.equal(
      'https://cdn.test/new-media/avatars/avatar.png',
    )
  })
  it('preserves full public IDs and forwards video resource types', async () => {
    const urls = createConfiguredMediaUrl(
      async () => 'new-media/',
      (id, type) => `${type}:${id}`,
    )
    expect(
      await urls.url(
        'sellit-media/products/dress.png',
        'image/png',
        'products',
      ),
    ).to.equal('image:sellit-media/products/dress.png')
    expect(await urls.url('clip', 'video/mp4', 'products')).to.equal(
      'video:new-media/products/clip',
    )
  })
  it('does not hide configuration lookup failures', async () => {
    const urls = createConfiguredMediaUrl(
      async () => {
        throw new Error('DB unavailable')
      },
      (id) => id,
    )
    try {
      await urls.url('dress.png')
      throw new Error('expected rejection')
    } catch (error) {
      expect((error as Error).message).to.equal('DB unavailable')
    }
  })
}
