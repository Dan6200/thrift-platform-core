export interface StoreStaff {
  store_id: number
  staff_id: string // uuid
  role: 'admin' | 'editor' | 'viewer'
  created_at?: Date
  updated_at?: Date
}
