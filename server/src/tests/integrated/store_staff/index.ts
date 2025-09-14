import chai from 'chai'
import chaiHttp from 'chai-http'
import {
  testAddStaff,
  testListStaff,
  testUpdateStaff,
  testRemoveStaff,
  testAddStaffForbidden,
  testListStaffForbidden,
  testUpdateStaffForbidden,
  testRemoveStaffForbidden,
} from './definitions/index.js'
import { ProfileRequestData } from '../../../types/profile/index.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'

// globals
chai.use(chaiHttp).should()
// Set server url
const server = process.env.SERVER!

export default function ({ 
  vendorInfo,
  customerInfo,
}: { 
  vendorInfo: ProfileRequestData
  customerInfo: ProfileRequestData
}) {
  let ownerToken: string
  let staffToken: string
  let storeId: string
  let ownerId: string
  let staffId: string

  before(async () => {
    ownerId = await createUserForTesting(vendorInfo)
    staffId = await createUserForTesting(customerInfo)
    ownerToken = await signInForTesting(vendorInfo)
    staffToken = await signInForTesting(customerInfo)
    const response = await createStoreForTesting(ownerToken)
    storeId = response.body.store_id
  })

  after(async () => {
    await deleteUserForTesting(ownerId)
    await deleteUserForTesting(staffId)
  })

  const getStaffRoute = (sId: string) => `/v1/stores/${sId}/staff`
  const getStaffIdRoute = (sId: string, stId: string) => `/v1/stores/${sId}/staff/${stId}`

  describe('Testing /store_staff endpoints', () => {
    it('it should allow the store owner to add a staff member', async () => {
      await testAddStaff({
        server,
        path: getStaffRoute(storeId),
        token: ownerToken,
        requestBody: {
          staff_id: staffId,
          role: 'editor',
        },
      })
    })

    it('it should not allow a non-owner to add a staff member', async () => {
      await testAddStaffForbidden({
        server,
        path: getStaffRoute(storeId),
        token: staffToken,
        requestBody: {
          staff_id: ownerId,
          role: 'admin',
        },
      })
    })

    it('it should allow the store owner to list staff members', async () => {
      await testListStaff({
        server,
        path: getStaffRoute(storeId),
        token: ownerToken,
      })
    })

    it('it should allow a staff member to list staff members', async () => {
      await testListStaff({
        server,
        path: getStaffRoute(storeId),
        token: staffToken,
      })
    })

    it('it should allow the store owner to update a staff member\'s role', async () => {
      await testUpdateStaff({
        server,
        path: getStaffIdRoute(storeId, staffId),
        token: ownerToken,
        requestBody: {
          role: 'viewer',
        },
      })
    })

    it('it should not allow a non-owner to update a staff member\'s role', async () => {
      await testUpdateStaffForbidden({
        server,
        path: getStaffIdRoute(storeId, staffId),
        token: staffToken,
        requestBody: {
          role: 'admin',
        },
      })
    })

    it('it should allow the store owner to remove a staff member', async () => {
      await testRemoveStaff({
        server,
        path: getStaffIdRoute(storeId, staffId),
        token: ownerToken,
      })
    })

    it('it should not allow a non-owner to remove a staff member', async () => {
      // Re-add the staff member first
      await testAddStaff({
        server,
        path: getStaffRoute(storeId),
        token: ownerToken,
        requestBody: {
          staff_id: staffId,
          role: 'editor',
        },
      })
      await testRemoveStaffForbidden({
        server,
        path: getStaffIdRoute(storeId, staffId),
        token: staffToken,
      })
    })
  })
}
