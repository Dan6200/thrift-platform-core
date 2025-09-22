import {
  AddStoreStaffSchema,
  UpdateStoreStaffSchema,
  StoreStaffListResponseSchema,
  StoreStaffResponseSchema,
} from '#src/app-schema/store_staff.js'

export const isValidAddStoreStaffRequest = (data: unknown) =>
  AddStoreStaffSchema.validate(data).error === undefined

export const isValidUpdateStoreStaffRequest = (data: unknown) =>
  UpdateStoreStaffSchema.validate(data).error === undefined

export const isValidStoreStaffListResponse = (data: unknown) =>
  StoreStaffListResponseSchema.validate(data).error === undefined

export const isValidStoreStaffResponse = (data: unknown) =>
  StoreStaffResponseSchema.validate(data).error === undefined
