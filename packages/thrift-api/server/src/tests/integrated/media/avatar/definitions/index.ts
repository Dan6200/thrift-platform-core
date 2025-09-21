import chai from 'chai'
import chaiHttp from 'chai-http'
import { readFile } from 'node:fs/promises'
import { StatusCodes } from 'http-status-codes'
import { MediaUpload } from '#src/types/media.js'

chai.use(chaiHttp).should()

const { CREATED, OK, NO_CONTENT } = StatusCodes

export const testCreateAvatar = async function (
  server: string,
  urlPath: string,
  media: MediaUpload, // This should be a single file, not an array
  token: string,
): Promise<any> {
  const fieldName = 'avatar'
  const data = await readFile(media.path)
  const response = await chai
    .request(server)
    .post(urlPath)
    .auth(token, { type: 'bearer' })
    .attach(fieldName, data, media.name)
    .field('description', media.description)
    .field('filetype', media.filetype)

  response.should.have.status(CREATED)
  return response
}

export const testGetAvatar = async function (
  server: string,
  urlPath: string,
  token: string,
): Promise<any> {
  const response = await chai.request(server).get(urlPath).auth(token, { type: 'bearer' })
  response.should.have.status(OK)
  return response
}

export const testUpdateAvatar = async function (
  server: string,
  urlPath: string,
  media: MediaUpload,
  token: string,
): Promise<any> {
  const fieldName = 'avatar'
  const data = await readFile(media.path)
  const response = await chai
    .request(server)
    .patch(urlPath)
    .auth(token, { type: 'bearer' })
    .attach(fieldName, data, media.name)
    .field('description', media.description)
  response.should.have.status(OK)
  return response
}

export const testDeleteAvatar = async function (
  server: string,
  urlPath: string,
  token: string,
): Promise<any> {
  const response = await chai.request(server).delete(urlPath).auth(token, { type: 'bearer' })
  response.should.have.status(NO_CONTENT)
  return response
}