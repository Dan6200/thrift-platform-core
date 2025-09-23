// server/src/controllers/store_staff/index.ts

import { StatusCodes } from 'http-status-codes'
import { knex } from '#src/db/index.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody, // Added import
  QueryParams,
} from '#src/types/process-routes.js'
import processRoute from '#src/controllers/process-routes.js'
import { validateReqData } from '#src/controllers/utils/request-validation.js'
import { validateResData } from '#src/controllers/utils/response-validation.js'
import {
  AddStoreStaffSchema,
  UpdateStoreStaffSchema,
  StoreStaffResponseSchema,
  StoreStaffListResponseSchema,
  RemoveStoreStaffResponseSchema,
} from '#src/app-schema/store_staff.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import ForbiddenError from '#src/errors/forbidden.js'
import BadRequestError from '#src/errors/bad-request.js'
import NotFoundError from '#src/errors/not-found.js'

const addStaffQuery = async ({ params, body, userId }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('You must be logged in to add staff.')
  }
  if (!params?.storeId) {
    throw new BadRequestError('Store ID is required.')
  }

  const { storeId } = params
  const { staff_id, role } = body

  // Check if the current user is the owner of the store
  const store = await knex('stores')
    .where({ store_id: storeId, vendor_id: userId })
    .first()
  if (!store) {
    throw new ForbiddenError('You are not the owner of this store.')
  }

  // Add the staff member
  const newStaff = await knex('store_staff')
    .insert({
      store_id: storeId,
      staff_id,
      role,
    })
    .returning('*')

  return newStaff
}

const listStaffQuery = async ({ params, userId }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('You must be logged in to list staff.')
  }
  if (!params?.storeId) {
    throw new BadRequestError('Store ID is required.')
  }

  const { storeId } = params

  // Check if the current user is the owner or staff of the store
  const isOwnerOrStaff = await knex('stores')
    .where({ store_id: storeId, vendor_id: userId })
    .first()
  if (!isOwnerOrStaff) {
    const isStaff = await knex('store_staff')
      .where({ store_id: storeId, staff_id: userId })
      .first()
    if (!isStaff) {
      throw new ForbiddenError(
        'You do not have permission to list staff for this store.',
      )
    }
  }

  // Retrieve all staff members for the store
  const staffList = await knex('store_staff')
    .where({ store_id: storeId })
    .select('*')

  return staffList
}

const updateStaffQuery = async ({ params, body, userId }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('You must be logged in to update staff.')
  }
  if (!params?.storeId || !params?.staffId) {
    throw new BadRequestError('Store ID and Staff ID are required.')
  }

  const { storeId, staffId } = params
  const { role } = body

  // Check if the current user is the owner of the store
  const store = await knex('stores')
    .where({ store_id: storeId, vendor_id: userId })
    .first()
  if (!store) {
    throw new ForbiddenError('You are not the owner of this store.')
  }

  // Update the staff member's role
  const updatedStaff = await knex('store_staff')
    .where({ store_id: storeId, staff_id: staffId })
    .update({ role })
    .returning('*')

  if (!updatedStaff[0]) {
    throw new NotFoundError('Staff member not found for this store.')
  }

  return updatedStaff
}

const removeStaffQuery = async ({ params, userId }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('You must be logged in to remove staff.')
  }
  if (!params?.storeId || !params?.staffId) {
    throw new BadRequestError('Store ID and Staff ID are required.')
  }

  const { storeId, staffId } = params

  // Check if the current user is the owner of the store
  const store = await knex('stores')
    .where({ store_id: storeId, vendor_id: userId })
    .first()
  if (!store) {
    throw new ForbiddenError('You are not the owner of this store.')
  }

  // Remove the staff member
  const deletedCount = await knex('store_staff')
    .where({ store_id: storeId, staff_id: staffId })
    .del()

  if (deletedCount === 0) {
    throw new NotFoundError('Staff member not found for this store.')
  }

  return { message: 'Staff member removed successfully.' }
}

const { CREATED } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const addStaff = processPostRoute({
  Query: addStaffQuery,
  status: CREATED,
  validateBody: validateReqData(AddStoreStaffSchema),
  validateResult: validateResData(StoreStaffResponseSchema),
})

const processGetRoute = <ProcessRouteWithoutBody>processRoute // Changed
export const listStaff = processGetRoute({
  Query: listStaffQuery,
  status: StatusCodes.OK,
  validateResult: validateResData(StoreStaffListResponseSchema),
})

const processPutRoute = <ProcessRoute>processRoute
export const updateStaff = processPutRoute({
  Query: updateStaffQuery,
  status: StatusCodes.OK,
  validateBody: validateReqData(UpdateStoreStaffSchema),
  validateResult: validateResData(StoreStaffResponseSchema),
})

const processDeleteRoute = <ProcessRouteWithoutBody>processRoute // Changed
export const removeStaff = processDeleteRoute({
  Query: removeStaffQuery,
  status: StatusCodes.NO_CONTENT,
  validateResult: validateResData(RemoveStoreStaffResponseSchema),
})
