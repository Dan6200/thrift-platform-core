import joi from 'joi'

export const AddStoreStaffSchema = joi.array().items(joi.object({
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})).length(1)

export const UpdateStoreStaffSchema = joi.array().items(joi.object({
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})).length(1)

export const StoreStaffResponseSchema = joi.array().items(joi.object({
  store_id: joi.number().required(),
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
})).length(1)

export const StoreStaffListResponseSchema = joi.array().items(joi.array().items(StoreStaffResponseSchema).length(1))

export const RemoveStoreStaffResponseSchema = joi.array().items(joi.object({
  message: joi.string().required(),
})).length(1)