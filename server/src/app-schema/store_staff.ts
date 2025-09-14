import joi from 'joi'

export const AddStoreStaffSchema = joi.object({
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})

export const UpdateStoreStaffSchema = joi.object({
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})

export const StoreStaffResponseSchema = joi.object({
  store_id: joi.number().required(),
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
})

export const StoreStaffListResponseSchema = joi.array().items(StoreStaffResponseSchema)

export const RemoveStoreStaffResponseSchema = joi.object({
  message: joi.string().required(),
})