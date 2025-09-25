import chai from 'chai'
import chaiHttp from 'chai-http'
import {
  testAddStaff,
  testListStaff,
  testUpdateStaff,
  testRemoveStaff,
  testAddStaffUnauthorized,
  testListStaffUnauthorized,
  testUpdateStaffUnauthorized,
  testRemoveStaffUnauthorized,
} from './definitions/index.js'
import { ProfileRequestData } from '../../../types/profile/index.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'
import { StoreStaff } from '#src/types/store_staff.js'

// globals
chai.use(chaiHttp).should()

export default function ({
  vendorInfo,
  customerInfo,
}: {
  vendorInfo: ProfileRequestData
  customerInfo: ProfileRequestData
}) {
  let ownerToken: string
  let staffToken: string
  let storeId: number
  let ownerId: string
  let staffId: string

  before(async () => {
    ownerId = await createUserForTesting(vendorInfo)
    staffId = await createUserForTesting(customerInfo)
    ownerToken = await signInForTesting(vendorInfo)
    staffToken = await signInForTesting(customerInfo)
    const response = await createStoreForTesting(ownerToken)
    ;[{ store_id: storeId }] = response.body
  })

  after(async () => {
    await deleteUserForTesting(ownerId)
    await deleteUserForTesting(staffId)
  })

  describe('Testing /store_staff endpoints', () => {
    it('it should allow the store owner to add a staff member', async () => {
      const expectedData: StoreStaff = {
        staff_id: staffId,
        role: 'editor',
      }
      await testAddStaff({
        token: ownerToken,
        params: { storeId },
        body: expectedData,
        expectedData,
      })
    })

    it('it should not allow a non-owner to add a staff member', async () => {
      await testAddStaffUnauthorized({
        token: staffToken,
        params: { storeId },
        body: {
          staff_id: ownerId,
          role: 'admin',
        },
      })
    })

    it('it should allow the store owner to list staff members', async () => {
      await testListStaff({
        token: ownerToken,
        params: { storeId },
      })
    })

    it('it should allow a staff member to list staff members', async () => {
      await testListStaff({
        token: staffToken,
        params: { storeId },
      })
    })

    it("it should allow the store owner to update a staff member's role", async () => {
      const expectedData: StoreStaff = {
        staff_id: staffId,
        role: 'viewer',
      }
      await testUpdateStaff({
        token: ownerToken,
        params: { storeId, staffId },
        body: { role: 'viewer' },
        expectedData,
      })
    })

    it("it should not allow a non-owner to update a staff member's role", async () => {
      await testUpdateStaffUnauthorized({
        token: staffToken,
        params: { storeId, staffId },
        body: {
          role: 'admin',
        },
      })
    })

    it('it should allow the store owner to remove a staff member', async () => {
      await testRemoveStaff({
        token: ownerToken,
        params: { storeId, staffId },
      })
    })

    it('it should not allow a non-owner to remove a staff member', async () => {
      // Re-add the staff member first
      const expectedData: StoreStaff = {
        staff_id: staffId,
        role: 'editor',
      }
      await testAddStaff({
        token: ownerToken,
        params: { storeId },
        body: expectedData,
        expectedData,
      })
      await testRemoveStaffUnauthorized({
        token: staffToken,
        params: { storeId, staffId },
      })
    })
  })
}
