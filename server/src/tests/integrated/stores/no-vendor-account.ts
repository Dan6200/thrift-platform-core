import StoreData from '#src/types/store-data.js'
import {
  testCreateStoreWithoutVendorAccount,
  testUpdateStoreWithoutVendorAccount,
  testDeleteStoreWithoutVendorAccount,
} from '../stores/definitions/index.js'
import assert from 'assert'
import { ProfileRequestData } from '../../../types/profile/index.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'

export default function ({
  vendorInfo,
  nonVendorInfo,
  stores,
  updatedStores,
}: {
  vendorInfo: ProfileRequestData
  nonVendorInfo: ProfileRequestData
  stores: StoreData[]
  updatedStores: StoreData[]
}) {
  const server = process.env.SERVER!
  let nonVendorToken: string
  let nonVendorUserId: string
  let vendorToken: string
  let vendorUserId: string
  let storeId: string

  before(async () => {
    vendorUserId = await createUserForTesting(vendorInfo)
    vendorToken = await signInForTesting(vendorInfo)
    const response = await createStoreForTesting(vendorToken)
    storeId = response.body.store_id
  })

  beforeEach(async () => {
    nonVendorUserId = await createUserForTesting(nonVendorInfo)
    nonVendorToken = await signInForTesting(nonVendorInfo)
  })

  after(async () => {
    await deleteUserForTesting(vendorUserId)
  })

  afterEach(async () => {
    await deleteUserForTesting(nonVendorUserId)
  })

  const path = '/v1/stores'

  it('should fail to create a store when no vendor account exists', async () => {
    assert(!!stores.length)
    for (const store of stores) {
      await testCreateStoreWithoutVendorAccount({
        server,
        token: nonVendorToken,
        path,
        requestBody: store,
      })
    }
  })

  it('should fail to update stores when no vendor account exists', async () => {
    for (const store of updatedStores) {
      await testUpdateStoreWithoutVendorAccount({
        server,
        token: nonVendorToken,
        path: path + '/' + storeId,
        requestBody: store,
      })
    }
  })

  it('should fail to delete stores when no vendor account exists', async () => {
    await testDeleteStoreWithoutVendorAccount({
      server,
      token: nonVendorToken,
      path: path + '/' + storeId,
    })
  })
}

