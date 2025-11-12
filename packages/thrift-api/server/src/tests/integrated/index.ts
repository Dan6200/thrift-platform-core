//cspell:disable
import testProfile from './profiles/index.js'
import testProfileWithoutSignIn from './profiles/no-signin.js'
import testStoresWithNoAccess from './stores/no-access.js'
import testStores from './stores/index.js'
import testDelivery from './delivery-info/index.js'
import testProducts from './products/index.js'
import testMedia from './media/index.js'
import * as Ebuka from './data/users/customers/user-ebuka/index.js'
import * as Aisha from './data/users/customers/user-aisha/index.js'
import * as Mustapha from './data/users/customers/user-mustapha/index.js'
import * as Aliyu from './data/users/vendors/user-aliyu/index.js'
import testAnalytics from './analytics/index.js'
import testStoreStaff from './store_staff/index.js'
import testCart from './cart/index.js'
import testProductReviews from './reviews/products/index.js'
import testOrders from './orders/index.js'

const users = [Ebuka, Aliyu, Aisha, Mustapha]
const customers = [Ebuka, Aisha, Mustapha] // is_customer is true
const vendors = [Aliyu] // is_vendor is true

export default function (): void {
  /** User Account actions **/

  for (let user of users) {
    const { userInfo } = user
    const { first_name: name } = userInfo
    describe(`Testing retrieving user Profile for ${name}`, () =>
      testProfile(user))
    describe(`Testing retrieving user Profile without Signing In`, () =>
      testProfileWithoutSignIn(user))
  }

  /** Delivery Info related tests **/

  for (let customer of customers) {
    const { userInfo } = customer
    const { first_name: name } = userInfo
    describe(`Testing the Delivery Information of ${name}'s account`, async () =>
      testDelivery(customer))
  }

  /** Stores related tests **/

  for (let vendor of vendors) {
    const { userInfo } = vendor
    const { first_name: name } = userInfo
    describe(`Testing Stores owned by ${name}`, () =>
      testStores({
        userInfo: vendor.userInfo,
        stores: vendor.listOfStores,
        updatedStores: vendor.updatedStores,
      }))
  }

  for (let vendor of vendors) {
    describe(`Testing Store access without a vendor account`, () =>
      testStoresWithNoAccess({
        vendorInfo: vendor.userInfo,
        nonVendorInfo: customers[0].userInfo,
        stores: vendor.listOfStores,
        updatedStores: vendor.updatedStores,
      }))
  }

  /** Cart related tests **/
  for (let customer of customers) {
    const { userInfo } = customer
    const { first_name: name } = userInfo
    describe(`Testing Cart for ${name}`, () => testCart(customer))
  }

  /** Product related tests **/

  for (let vendor of vendors) {
    const { userInfo } = vendor
    const { first_name: name } = userInfo
    describe(`Testing Products listed by ${name}`, async () =>
      testProducts(vendor))
  }

  /** Media related tests **/

  // for (let user of users) {
  //   describe(`Skipping Media File Upload Tests for ${user.userInfo.first_name}`, async () =>
  //     it('should skip', (done) => done()))
  // }

  for (let user of users) {
    describe(`Testing Media File Upload for ${user.userInfo.first_name}`, async () =>
      testMedia(user))
  }

  /** Dashboard related tests **/

  for (let vendor of vendors) {
    const { userInfo } = vendor
    const { first_name: name } = userInfo
    describe(`Testing Dashboard Analytics for ${name}`, () =>
      testAnalytics(vendor))
  }

  /** Store Staff related tests **/

  for (let vendor of vendors) {
    for (let customer of customers) {
      const { userInfo: vendorInfo } = vendor
      const { userInfo: customerInfo } = customer
      const { first_name: vendorName } = vendorInfo
      const { first_name: customerName } = customerInfo
      describe(`Testing Store Staff for ${vendorName} with staff ${customerName}`, () =>
        testStoreStaff({ vendorInfo, customerInfo }))
    }
  }

  /** Order related tests **/
  for (let customer of customers) {
    const { userInfo } = customer
    const { first_name: name } = userInfo
    describe(`Testing Orders for ${name}`, () => testOrders(customer))
  }

  /** Product Reviews related tests **/
  for (let customer of customers) {
    const { userInfo } = customer
    const { first_name: name } = userInfo
    describe(`Testing Product Reviews for ${name}`, () =>
      testProductReviews(customer))
  }

  //
  // end
}
