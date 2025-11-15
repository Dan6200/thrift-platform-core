import { zodResolver } from '@hookform/resolvers/zod'
import { storeFormSchema } from './schema'
import { UseFormProps } from 'react-hook-form'
import { StoreFormType } from './types'

const useFormProps: UseFormProps<StoreFormType> = {
  resolver: zodResolver(storeFormSchema as any),
  defaultValues: {
    store_name: '',
    vendor_id: '',
    custom_domain: null,
    store_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_postal_code: '',
      country: '',
    },
    favicon: '',
    default_page_styling: {},
    store_pages: [],
  },
}

export default useFormProps
