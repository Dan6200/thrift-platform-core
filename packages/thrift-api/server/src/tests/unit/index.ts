// cspell:disable
import { handleSortQuery } from '#src/logic/products/utility.js'
import chai from 'chai'

chai.should()

export default () => {
  it('it should create a database query from a query parameter input', () =>
    handleSortQuery('-list_price,-net_price,product_id').should.equal(
      `ORDER BY list_price DESC, net_price DESC, product_id ASC`,
    ))

  it('it should create a database query from a query parameter input', () =>
    handleSortQuery('store_id,list_price,-net_price').should.equal(
      `ORDER BY store_id ASC, list_price ASC, net_price DESC`,
    ))

  it('it should create a database query from a query parameter input', () =>
    handleSortQuery('product_id,list_price,-net_price').should.equal(
      `ORDER BY product_id ASC, list_price ASC, net_price DESC`,
    ))
}
