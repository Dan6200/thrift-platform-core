import chai from 'chai'

export const createOrderForTesting = async (
  token: string,
  query: any,
  payload: any,
) =>
  chai
    .request(process.env.SERVER!)
    .post('/v1/orders')
    .auth(token, { type: 'bearer' })
    .query(query)
    .send(payload)
