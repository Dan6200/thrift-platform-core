import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { QueryResult } from 'pg'
import { ParsedQs } from 'qs'
import { RequestWithPayload } from './request.js'
const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes

export type Status =
  | typeof CREATED
  | typeof OK
  | typeof NO_CONTENT
  | typeof NOT_FOUND

export type QueryParams = {
  userId?: string
  body?: Record<string, any>
  params?: Record<string, string>
  query?: ParsedQs
}

export type QueryParamsMedia = QueryParams & {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }
  file?: Express.Multer.File | { [fieldname: string]: Express.Multer.File }
}

export type QueryDB = (
  queryParams: QueryParams | QueryParamsMedia,
) => Promise<Record<string, any>>

export type QueryDBWithNoResult = (
  queryParams: QueryParams | QueryParamsMedia,
) => Promise<void>

export type ProcessRouteWithoutBody = <T>({
  Query,
  status,
  validateResult,
  validateQuery,
}: {
  // Query(queryParams: QueryParams | QueryParamsMedia): Promise<T | T[]>
  Query: QueryDB
  status: Status
  validateResult: (result: QueryResult<T | T[]>) => boolean
  validateQuery?: (data: unknown) => boolean
}) => (
  request: RequestWithPayload,
  response: Response,
) => Promise<Response<T, Record<string, T>>>

export type ProcessRouteWithNoDBResult = <T>({
  Query,
  status,
  validateBody,
  validateQuery,
}: {
  Query: QueryDBWithNoResult
  // Query: (queryData: {
  //   userId?: string
  //   body?: Record<string, T>
  //   params?: Record<string, string>
  //   query?: ParsedQs
  // }) => Promise<Record<string, T>>
  status: Status
  validateBody?: (data: unknown) => boolean
  validateQuery?: (data: unknown) => boolean
}) => (
  request: RequestWithPayload,
  response: Response,
) => Promise<Response<T, Record<string, T>>>

export type ProcessRouteWithoutBodyAndDBResult = ({
  Query,
  status,
  validateQuery,
}: {
  Query: QueryDBWithNoResult
  validateQuery?: (data: unknown) => boolean
  status: Status
}) => (request: RequestWithPayload, response: Response) => Promise<void>

export type ProcessRoute = <T>({
  Query,
  status,
  validateBody,
  validateResult,
  validateQuery,
}: {
  Query: QueryDB
  status: Status
  validateBody: (data: unknown) => boolean
  validateResult: (result: QueryResult<T | T[]>) => boolean
  validateQuery?: (data: unknown) => boolean
}) => (
  request: RequestWithPayload,
  response: Response,
) => Promise<Response<T, Record<string, T>>>
