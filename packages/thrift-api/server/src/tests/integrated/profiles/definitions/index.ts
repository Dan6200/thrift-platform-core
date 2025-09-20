import chai from 'chai'
import chaiHttp from 'chai-http'
import { readFile } from 'node:fs/promises'
import { StatusCodes } from 'http-status-codes'
import { ProfileRequestData } from '#src/types/profile/index.js'

chai.use(chaiHttp).should()

const { CREATED } = StatusCodes

export const testCreateAvatar = async function (
  server: string,
  urlPath: string,
  media: any, // This should be a single file, not an array
  token: string,
): Promise<any> {
  const { filename, path: filepath } = media

  const formData = new FormData()
  formData.append('avatar', await readFile(filepath), filename) // 'avatar' is the field name for single file upload

  const response = await chai
    .request(server)
    .post(urlPath)
    .auth(token, { type: 'bearer' })
    .set('Content-Type', 'multipart/form-data')
    .send(formData)

  response.should.have.status(CREATED)
  return response
}
