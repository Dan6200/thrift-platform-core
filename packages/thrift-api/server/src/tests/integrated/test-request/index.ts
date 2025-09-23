import chai from 'chai'
import { TestRequestParams } from './types.js'

export default function ({
  verb,
  statusCode,
  validateTestResData,
  validateTestReqData,
}: TestRequestParams) {
  return async function <T>({
    server,
    params,
    query,
    token,
    body,
  }: {
    server: string
    params: string
    token: string
    query?: { [k: string]: any }
    body?: T
  }) {
    // Validate the request body first
    if (body && !validateTestReqData)
      throw new Error('Must validate test request data')
    if (validateTestReqData && !validateTestReqData({ params, body, query }))
      throw new Error('Invalid Test Request Data')

    // Make request
    const request = chai
      .request(server)
      [verb](params)
      .query(query ?? {})
      .send(<object>body)

    process.env.DEBUG &&
      console.log('\nDEBUG: request ->' + JSON.stringify(request) + '\n')

    // Add request token
    if (token) request.auth(token, { type: 'bearer' })
    const response = await request

    process.env.DEBUG &&
      console.log(
        '\nDEBUG: response.body ->',
        JSON.stringify(response.body),
        ' \n',
      )
    response.should.have.status(statusCode)

    // Validate the response body
    if (validateTestResData && !validateTestResData(response.body)) {
      if (response.body.length === 0) {
        return []
      }
      throw new Error('Invalid Database Result') //Now allowing empty responses
    }

    return response.body
  }
}
