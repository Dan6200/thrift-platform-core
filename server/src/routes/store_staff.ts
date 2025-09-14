import { Router } from 'express'
import { addStaff, listStaff, updateStaff, removeStaff } from '#src/controllers/store_staff/index.js'

const router = Router()

router.route('/:storeId/staff')
  .post(addStaff)
  .get(listStaff)

router.route('/:storeId/staff/:staffId')
  .put(updateStaff)
  .delete(removeStaff)

export default router
