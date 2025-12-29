// packages/thrift-api/server/src/tests/integrated/payments/index.ts
import { expect } from 'chai'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { createUserForTesting } from '../../helpers/create-user.js'
import { deleteUserForTesting } from '../../helpers/delete-user.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { createStoreForTesting } from '../../helpers/create-store.js'
import { loadUserData } from '../../helpers/load-data.js'
import { knex } from '#src/db/index.js'
import {
  testInitializePayment,
  testPaystackWebhook,
} from './definitions/index.js'

const {
  OK,
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = StatusCodes

// Load test data
const customerData = loadUserData(
  'server/src/tests/integrated/data/users/customers/user-aisha',
)
const vendorData = loadUserData(
  'server/src/tests/integrated/data/users/vendors/user-aliyu',
)

describe('Payments', () => {
  let customerToken: string
  let vendorToken: string

  let customerUserId: string
  let vendorUserId: string

  let testOrderId: number
  let testStoreId: string
  let testPaystackSecret: string

  before(async () => {
    // 1. Create Users
    customerUserId = await createUserForTesting(customerData.userInfo)
    vendorUserId = await createUserForTesting(vendorData.userInfo)

    // 2. Sign In to get tokens
    customerToken = await signInForTesting({
      email: customerData.userInfo.email,
      password: customerData.userInfo.password,
    })
    vendorToken = await signInForTesting({
      email: vendorData.userInfo.email,
      password: vendorData.userInfo.password,
    })

    // 3. Create Store for Vendor
    // createStoreForTesting uses predefined data from helpers/create-store.ts (user-aliyu/stores.yml)
    const storeRes = await createStoreForTesting(vendorToken)
    testStoreId = storeRes.body.store_id

    // 4. Create Order manually in DB
    // We assume store creation succeeded. If not, tests will fail here.
    const [order] = await knex('orders')
      .insert({
        customer_id: customerUserId,
        store_id: testStoreId,
        // delivery_info_id: uuidv4(), // Optional, skipping for simplicity unless required constraint
        total_amount: 1000,
        status: 'pending',
      })
      .returning('order_id')
    testOrderId = order.order_id

    // Store Paystack secret for webhook signature generation
    testPaystackSecret = process.env.PAYSTACK_SECRET_KEY || 'test_secret'
  })

  after(async () => {
    // Cleanup
    if (testOrderId) await knex('orders').where({ order_id: testOrderId }).del()

    // Deleting users should cascade delete stores/orders if foreign keys are set up that way,
    // but explicit deleteUserForTesting handles auth.users and public.profiles cleanup.
    if (customerUserId) await deleteUserForTesting(customerUserId)
    if (vendorUserId) await deleteUserForTesting(vendorUserId)
  })

  describe('POST /payments/initialize', () => {
    it('should initialize a payment and return Paystack authorization URL', async () => {
      const response = await testInitializePayment({
        token: customerToken,
        body: { order_id: testOrderId },
      })

      expect(response.status).to.equal(OK)
      expect(response.body)
        .to.have.property('authorization_url')
        .that.is.a('string')
      expect(response.body).to.have.property('reference').that.is.a('string')
      expect(response.body).to.have.property('access_code').that.is.a('string')

      // Verify payment_reference is updated in the database
      const updatedOrder = await knex('orders')
        .where({ order_id: testOrderId })
        .first()
      expect(updatedOrder)
        .to.have.property('payment_reference')
        .that.equals(response.body.reference)
    })

    it('should return 400 if order_id is missing', async () => {
      const response = await testInitializePayment({
        token: customerToken,
        body: { order_id: undefined as any },
        expectedStatusCode: BAD_REQUEST,
      })
      expect(response.status).to.equal(BAD_REQUEST)
    })

    it('should return 404 if order does not exist', async () => {
      const response = await testInitializePayment({
        token: customerToken,
        body: { order_id: 99999999 },
        expectedStatusCode: NOT_FOUND,
      })
      expect(response.status).to.equal(NOT_FOUND)
    })

    it('should return 400 if order is not in pending status', async () => {
      // Create a new order and set its status to something else
      const [nonPendingOrder] = await knex('orders')
        .insert({
          customer_id: customerUserId,
          store_id: testStoreId,
          total_amount: 500,
          status: 'completed',
        })
        .returning('order_id')

      const response = await testInitializePayment({
        token: customerToken,
        body: { order_id: nonPendingOrder.order_id },
        expectedStatusCode: BAD_REQUEST,
      })
      expect(response.status).to.equal(BAD_REQUEST)

      await knex('orders').where({ order_id: nonPendingOrder.order_id }).del()
    })

    it('should return 401 if user is unauthenticated', async () => {
      const response = await testInitializePayment({
        token: 'invalid_token',
        body: { order_id: testOrderId },
        expectedStatusCode: UNAUTHORIZED,
      })
      expect(response.status).to.equal(UNAUTHORIZED)
    })

    it('should return 404 (or 403) if order does not belong to authenticated user', async () => {
      // Vendor tries to pay for Customer's order
      const response = await testInitializePayment({
        token: vendorToken,
        body: { order_id: testOrderId },
        expectedStatusCode: NOT_FOUND, // Logic throws NotFoundError for security
      })
      expect(response.status).to.equal(NOT_FOUND)
    })
  })

  describe('POST /payments/webhook', () => {
    let mockWebhookSecret: string

    before(() => {
      mockWebhookSecret = testPaystackSecret
    })

    const generatePaystackSignature = (payload: any, secret: string) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const hmac = require('crypto').createHmac('sha512', secret)
      return hmac.update(JSON.stringify(payload)).digest('hex')
    }

    it('should update order status on successful charge webhook', async () => {
      // Create a fresh order
      const [newOrder] = await knex('orders')
        .insert({
          customer_id: customerUserId,
          store_id: testStoreId,
          total_amount: 1200,
          status: 'pending',
          payment_reference: `TEST_REF_${uuidv4()}`,
        })
        .returning('order_id')

      const webhookPayload = {
        event: 'charge.success',
        data: {
          reference: newOrder.payment_reference,
          status: 'success',
          amount: 1200 * 100,
          metadata: { order_id: newOrder.order_id },
        },
      }
      const signature = generatePaystackSignature(
        webhookPayload,
        mockWebhookSecret,
      )

      // Mock Paystack verification
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const paystackSdk = require('@paystack/paystack-sdk')
      const originalVerify = paystackSdk.Paystack.prototype.transaction.verify
      paystackSdk.Paystack.prototype.transaction.verify = () =>
        Promise.resolve({
          status: true,
          data: { status: 'success' },
        })

      const response = await testPaystackWebhook({
        body: webhookPayload,
        headers: {
          'x-paystack-signature': signature,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).to.equal(OK)
      expect(response.body).to.have.property(
        'message',
        'Webhook processed successfully',
      )

      const updatedOrder = await knex('orders')
        .where({ order_id: newOrder.order_id })
        .first()
      expect(updatedOrder).to.have.property('status').that.equals('processing')

      paystackSdk.Paystack.prototype.transaction.verify = originalVerify
      await knex('orders').where({ order_id: newOrder.order_id }).del()
    })

    it('should return 400 for invalid Paystack signature', async () => {
      const webhookPayload = {
        event: 'charge.success',
        data: { reference: 'fake_ref' },
      }
      const invalidSignature = 'invalid_signature'

      const response = await testPaystackWebhook({
        body: webhookPayload,
        headers: {
          'x-paystack-signature': invalidSignature,
          'Content-Type': 'application/json',
        },
        expectedStatusCode: BAD_REQUEST,
      })
      expect(response.status).to.equal(BAD_REQUEST)
      expect(response.body).to.have.property(
        'message',
        'Invalid Paystack webhook signature.',
      )
    })

    it('should return 200 but not update order for unhandled event type', async () => {
      const [newOrder] = await knex('orders')
        .insert({
          customer_id: customerUserId,
          store_id: testStoreId,
          total_amount: 1000,
          status: 'pending',
          payment_reference: `TEST_REF_UNHANDLED_${uuidv4()}`,
        })
        .returning('order_id')

      const webhookPayload = {
        event: 'transfer.success', // Unhandled event
        data: { reference: newOrder.payment_reference, status: 'success' },
      }
      const signature = generatePaystackSignature(
        webhookPayload,
        mockWebhookSecret,
      )

      const response = await testPaystackWebhook({
        body: webhookPayload,
        headers: {
          'x-paystack-signature': signature,
          'Content-Type': 'application/json',
        },
        expectedStatusCode: OK,
      })

      expect(response.status).to.equal(OK)
      expect(response.body)
        .to.have.property('message')
        .that.includes('not handled')

      const originalOrder = await knex('orders')
        .where({ order_id: newOrder.order_id })
        .first()
      expect(originalOrder).to.have.property('status').that.equals('pending') // Status should not change

      await knex('orders').where({ order_id: newOrder.order_id }).del()
    })

    it('should return 500 if Paystack verification fails', async () => {
      const [newOrder] = await knex('orders')
        .insert({
          customer_id: customerUserId,
          store_id: testStoreId,
          total_amount: 1300,
          status: 'pending',
          payment_reference: `TEST_REF_FAIL_VERIFY_${uuidv4()}`,
        })
        .returning('order_id')

      const webhookPayload = {
        event: 'charge.success',
        data: {
          reference: newOrder.payment_reference,
          status: 'success',
          amount: 1300 * 100,
          metadata: { order_id: newOrder.order_id },
        },
      }
      const signature = generatePaystackSignature(
        webhookPayload,
        mockWebhookSecret,
      )

      // Mock Paystack verification to fail
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const paystackSdk = require('@paystack/paystack-sdk')
      const originalVerify = paystackSdk.Paystack.prototype.transaction.verify
      paystackSdk.Paystack.prototype.transaction.verify = () =>
        Promise.resolve({
          status: false, // Simulate failed verification
          data: { status: 'failed', gateway_response: 'Invalid transaction' },
        })

      const response = await testPaystackWebhook({
        body: webhookPayload,
        headers: {
          'x-paystack-signature': signature,
          'Content-Type': 'application/json',
        },
        expectedStatusCode: INTERNAL_SERVER_ERROR,
      })
      expect(response.status).to.equal(INTERNAL_SERVER_ERROR)
      expect(response.body)
        .to.have.property('message')
        .that.includes('verification failed')

      // Order status should not change from pending
      const originalOrder = await knex('orders')
        .where({ order_id: newOrder.order_id })
        .first()
      expect(originalOrder).to.have.property('status').that.equals('pending')

      paystackSdk.Paystack.prototype.transaction.verify = originalVerify // Restore
      await knex('orders').where({ order_id: newOrder.order_id }).del()
    })
  })
})
