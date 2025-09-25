import joi from 'joi'

// Base Schemas
export const StoreStaffDataSchema = joi.object({
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})

export const UpdateStoreStaffDataSchema = joi.object({
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
})

// Request Schemas
export const AddStoreStaffRequestSchema = joi.object({
  body: StoreStaffDataSchema.required(),
  params: joi.object({ storeId: joi.number().integer().positive().required() }).required(),
  query: joi.object().optional(),
})

export const ListStoreStaffRequestSchema = joi.object({
  params: joi.object({ storeId: joi.number().integer().positive().required() }).required(),
  body: joi.object().optional(),
  query: joi.object().optional(),
})

export const UpdateStoreStaffRequestSchema = joi.object({
  body: UpdateStoreStaffDataSchema.required(),
  params: joi.object({
    storeId: joi.number().integer().positive().required(),
    staffId: joi.string().guid({ version: 'uuidv4' }).required(),
  }).required(),
  query: joi.object().optional(),
})

export const RemoveStoreStaffRequestSchema = joi.object({
  params: joi.object({
    storeId: joi.number().integer().positive().required(),
    staffId: joi.string().guid({ version: 'uuidv4' }).required(),
  }).required(),
  body: joi.object().optional(),
  query: joi.object().optional(),
})

// Response Schemas
export const StoreStaffResponseSchema = joi.object({
  store_id: joi.number().required(),
  staff_id: joi.string().guid({ version: 'uuidv4' }).required(),
  role: joi.string().valid('admin', 'editor', 'viewer').required(),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
}).required()

export const StoreStaffListResponseSchema = joi.array().items(StoreStaffResponseSchema).required()

export const RemoveStoreStaffResponseSchema = joi.object({
  message: joi.string().required(),
})