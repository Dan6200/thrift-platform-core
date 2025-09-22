export interface DeliveryInfoId {
  delivery_info_id: number
}

export interface DeliveryInfo {
  delivery_info_id?: number
  recipient_full_name: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  zip_postal_code: string
  country: string
  phone_number: string
  delivery_instructions: string
  customer_id?: string
  created_at?: Date
  updated_at?: Date
}

