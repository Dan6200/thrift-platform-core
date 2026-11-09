import chai from 'chai'
import { createAvatarUseCase } from '#src/context/media/application/create-avatar.js'
import { updateAvatarUseCase } from '#src/context/media/application/update-avatar.js'
import { getAvatarUseCase } from '#src/context/media/application/get-avatar.js'
import { createProductMediaUseCase } from '#src/context/media/application/create-product-media.js'
import { updateProductMediaUseCase } from '#src/context/media/application/update-product-media.js'
import { MediaRepository } from '#src/context/media/ports/media-repository.js'
import {
  MediaStorage,
  RawUpload,
} from '#src/context/media/ports/media-storage.js'

chai.should()

const rawFile: RawUpload = {
  buffer: Buffer.from('fake-bytes'),
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
}

const stored = {
  filename: 'fake-id',
  filetype: 'image/jpeg',
}

const mediaUrl = {
  url: (filename: string) => `https://cdn.test/${filename}`,
}

const makeStorage = (overrides: Partial<MediaStorage> = {}): MediaStorage => ({
  async upload(): Promise<any> {
    return { ...stored }
  },
  ...overrides,
})

const makeRepo = (
  overrides: Partial<MediaRepository> = {},
): MediaRepository => ({
  async createAvatar(): Promise<unknown> {
    return undefined
  },
  async getAvatar(): Promise<unknown> {
    return null
  },
  async updateAvatar(): Promise<unknown> {
    return undefined
  },
  async deleteAvatar(): Promise<void> {
    return undefined
  },
  async createProductMedia(): Promise<unknown> {
    return undefined
  },
  async getProductMedia(): Promise<unknown> {
    return null
  },
  async updateProductMedia(): Promise<unknown> {
    return undefined
  },
  async deleteProductMedia(): Promise<void> {
    return undefined
  },
  ...overrides,
})

export default () => {
  describe('media use cases', () => {
    describe('createAvatarUseCase', () => {
      it('uploads to the avatars folder then persists the stored file', async () => {
        let uploadFolder: string | undefined
        let received: any = null
        const storage = makeStorage({
          upload: async (_file, folder) => {
            uploadFolder = folder
            return { ...stored }
          },
        })
        const repo = makeRepo({
          createAvatar: async (input) => {
            received = input
            return undefined
          },
        })

        await createAvatarUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          userId: 'u1',
          file: rawFile,
          description: 'me',
        })

        uploadFolder.should.equal('avatars')
        received.should.not.equal(null)
        received.userId.should.equal('u1')
        received.file.filename.should.equal('fake-id')
      })
    })

    describe('updateAvatarUseCase', () => {
      it('uploads when a file is provided', async () => {
        let uploadCalled = false
        let updated = false
        const storage = makeStorage({
          upload: async () => {
            uploadCalled = true
            return { ...stored }
          },
        })
        const repo = makeRepo({
          updateAvatar: async () => {
            updated = true
            return undefined
          },
        })

        await updateAvatarUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          userId: 'u1',
          file: rawFile,
        })

        uploadCalled.should.equal(true)
        updated.should.equal(true)
      })

      it('does not upload when no file is provided', async () => {
        let uploadCalled = false
        let received: any = null
        const storage = makeStorage({
          upload: async () => {
            uploadCalled = true
            return { ...stored }
          },
        })
        const repo = makeRepo({
          updateAvatar: async (input) => {
            received = input
            return undefined
          },
        })

        await updateAvatarUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          userId: 'u1',
          description: 'caption only',
        })

        uploadCalled.should.equal(false)
        received.should.not.equal(null)
        chai.expect(received.file).to.equal(undefined)
      })
    })

    describe('createProductMediaUseCase', () => {
      it('uploads every file to the products folder then persists', async () => {
        const folders: string[] = []
        let received: any = null
        const storage = makeStorage({
          upload: async (_file, folder) => {
            folders.push(folder)
            return { ...stored }
          },
        })
        const repo = makeRepo({
          createProductMedia: async (input) => {
            received = input
            return undefined
          },
        })

        await createProductMediaUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          userId: 'u1',
          productId: 5,
          files: [rawFile, rawFile],
          descriptions: {},
          isDisplayImage: {},
          isThumbnailImage: {},
          filetypes: {},
        })

        folders.should.deep.equal(['products', 'products'])
        received.should.not.equal(null)
        received.productId.should.equal(5)
        received.files.length.should.equal(2)
        received.files[0].originalname.should.equal('photo.jpg')
      })
    })

    describe('updateProductMediaUseCase', () => {
      it('uploads when a file is provided', async () => {
        let uploadCalled = false
        let received: any = null
        const storage = makeStorage({
          upload: async () => {
            uploadCalled = true
            return { ...stored }
          },
        })
        const repo = makeRepo({
          updateProductMedia: async (input) => {
            received = input
            return undefined
          },
        })

        await updateProductMediaUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          mediaId: 1,
          file: rawFile,
          description: 'updated',
        })

        uploadCalled.should.equal(true)
        received.should.not.equal(null)
        received.file.filename.should.equal('fake-id')
      })

      it('does not upload when no file is provided', async () => {
        let uploadCalled = false
        let received: any = null
        const storage = makeStorage({
          upload: async () => {
            uploadCalled = true
            return { ...stored }
          },
        })
        const repo = makeRepo({
          updateProductMedia: async (input) => {
            received = input
            return undefined
          },
        })

        await updateProductMediaUseCase(
          storage,
          mediaUrl,
          repo,
        )({
          mediaId: 1,
          description: 'caption only',
        })

        uploadCalled.should.equal(false)
        received.should.not.equal(null)
        chai.expect(received.file).to.equal(undefined)
      })
    })

    describe('getAvatarUseCase', () => {
      it('derives the filepath from the stored filename', async () => {
        const repo = makeRepo({
          getAvatar: async () => ({
            media_id: 1,
            filename: 'fake-id',
            filetype: 'image/jpeg',
            description: null,
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
            profile_id: 'u1',
          }),
        })

        const result: any = await getAvatarUseCase(mediaUrl, repo)('u1')

        result.filepath.should.equal('https://cdn.test/fake-id')
      })
    })
  })
}
