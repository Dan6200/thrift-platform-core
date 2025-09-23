import {
  testCreateDelivery,
  testGetAllDelivery,
  testGetDelivery,
  testUpdateDelivery,
  testDeleteDelivery,
  testGetNonExistentDelivery,
} from '../delivery-info/definitions/index.js'
import assert from 'assert'
import { ProfileRequestData } from '../../../types/profile/index.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { testHasCustomerAccount } from '../profiles/definitions.js'
import { DeliveryInfo } from '#src/types/delivery-info.js'

export default function ({
  userInfo,
  listOfDeliveryInfo,
  listOfUpdatedDeliveryInfo,
}: {
  userInfo: ProfileRequestData
  listOfDeliveryInfo: DeliveryInfo[]
  listOfUpdatedDeliveryInfo: DeliveryInfo[]
}) {
  const server = process.env.SERVER!
  let token: string
  let userId: string

  before(async () => {
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)
  })

  const deliveryPath = '/v1/delivery-info'

  const deliveryIds: number[] = []

  it("should have a customer's account", () =>
    testHasCustomerAccount({
      server,
      path: '/v1/me',
      token,
      req: {},
    }))

  it(`it should add multiple delivery addresses for the customer`, async () => {
    assert(!!listOfDeliveryInfo.length)
    for (const body of listOfDeliveryInfo) {
      const [{ delivery_info_id }] = await testCreateDelivery({
        server,
        path: deliveryPath,
        body,
        token,
        req: { body },
      })
      deliveryIds.push(delivery_info_id)
    }
  })

  it('it should retrieve all delivery information at once', async () => {
    await testGetAllDelivery({
      server,
      path: deliveryPath,
      token,
      req: {},
    })
  })

  it('it should retrieve all delivery information through a loop', async () => {
    assert(!!deliveryIds.length)
    for (const deliveryId of deliveryIds) {
      const path = deliveryPath + '/' + deliveryId
      await testGetDelivery({
        server,
        path,
        token,
        req: { params: { deliveryInfoId: deliveryId } },
      })
    }
  })

  it(`it should update all delivery addresses for the customer`, async () => {
    assert(
      !!deliveryIds.length &&
        deliveryIds.length === listOfUpdatedDeliveryInfo.length,
    )
    for (const [idx, deliveryId] of deliveryIds.entries()) {
      const body = { ...listOfUpdatedDeliveryInfo[idx] }
      const path = deliveryPath + '/' + deliveryId
      await testUpdateDelivery({
        server,
        path,
        body,
        token,
        req: { params: { deliveryInfoId: deliveryId }, body },
      })
    }
  })

  it(`it should delete all delivery addresses for the customer`, async () => {
    assert(!!deliveryIds.length)
    for (const deliveryId of deliveryIds) {
      await testDeleteDelivery({
        server,
        path: deliveryPath + '/' + deliveryId,
        token,
        req: { params: { deliveryInfoId: deliveryId } },
      })
    }
  })

  it(`it should fail to retrieve any of the deleted delivery information`, async () => {
    assert(!!deliveryIds.length)
    for (const deliveryId of deliveryIds) {
      await testGetNonExistentDelivery({
        server,
        path: `${deliveryPath}/${deliveryId}`,
        token,
        req: { params: { deliveryInfoId: deliveryId } },
      })
    }
  })

  after(async () => deleteUserForTesting(userId))
}
