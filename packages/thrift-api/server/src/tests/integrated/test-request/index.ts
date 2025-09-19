import chai from 'chai'
import { TestRequestParamsGeneral } from './types.js'

export default function ({
  verb,
  statusCode,
  validateTestResData,
  validateTestReqData,
}: TestRequestParamsGeneral) {
  return async function <T>({
    server,
    path,
    query,
    token,
    requestBody,
  }: {
    server: string
    path: string
    token: string
    query?: { [k: string]: any }
    requestBody?: T
  }) {
    // Validate the request body first
    if (requestBody && !validateTestReqData)
      throw new Error('Must validate test request data')
    if (validateTestReqData && !validateTestReqData(requestBody))
      throw new Error('Invalid Test Request Data')

    // Make request
    const request = chai
      .request(server)
      [verb](path)
      .query(query ?? {})
      .send(<object>requestBody)

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
    if (validateTestResData && !validateTestResData(response.body, query)) {
      if (response.body.length === 0) {
        return []
      }
      throw new Error('Invalid Database Result') //Now allowing empty responses
    }

    return response.body
  }
}
