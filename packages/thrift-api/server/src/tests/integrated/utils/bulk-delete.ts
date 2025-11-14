import { cloudinary } from '#src/utils/media-storage.js'

export async function bulkDeleteImages(slug: 'products' | 'avatars') {
  while (true) {
    try {
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'thrift-app-media-testing/' + slug,
        max_results: 100,
      })
      const publicIds = resources.map((resource: any) => resource.public_id)
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds)
      } else {
        process.env.DEBUG && console.log('No assets found in the folder')
        break
      }
    } catch (err) {
      console.error('Error deleting assets: ', err)
    }
  }
}
