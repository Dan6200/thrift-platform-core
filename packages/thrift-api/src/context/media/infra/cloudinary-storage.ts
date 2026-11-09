import { randomUUID } from 'node:crypto'
import { knex } from '#src/db/index.js'
import { cloudinary } from '#src/utils/media-storage.js'
import { MediaStorage } from '../ports/media-storage.js'

let cachedDamFolder: string | null = null
const damFolderPrefix = async (): Promise<string> => {
  if (cachedDamFolder !== null) return cachedDamFolder
  const row = await knex('app_config')
    .where({ config_key: 'dam_folder_prefix' })
    .first('config_value')
  cachedDamFolder = String(row?.config_value ?? 'sellit-media/')
  return cachedDamFolder
}

const folderFor = async (folder: 'avatars' | 'products'): Promise<string> => {
  const prefix = await damFolderPrefix()
  return prefix.endsWith('/') ? `${prefix}${folder}` : `${prefix}/${folder}`
}

const cloudinaryStorage: MediaStorage = {
  async upload(file, folder) {
    const uploadFolder = await folderFor(folder)
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          use_filename: true,
          unique_filename: true,
          overwrite: true,
          public_id: `${folder}-${Math.trunc(Math.random() * 1e9)}`,
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      )
      stream.end(file.buffer)
    })

    return {
      filename: result.public_id,
      filetype: file.mimetype,
    }
  },
}

/**
 * Test double for the MediaStorage port.
 *
 * Integration tests must never depend on live Cloudinary (flaky, slow,
 * external). Under `NODE_ENV=testing` uploads return a deterministic fake URL
 * that satisfies the response schemas; deletes are DB-only, so this is the only
 * operation that would otherwise touch Cloudinary.
 */
const inMemoryMediaStorage: MediaStorage = {
  async upload(file, folder) {
    const id = `test-${folder}-${randomUUID()}`
    return {
      filename: id,
      filetype: file.mimetype,
    }
  },
}

export const cloudinaryMediaStorage: MediaStorage =
  process.env.NODE_ENV === 'testing' ? inMemoryMediaStorage : cloudinaryStorage
