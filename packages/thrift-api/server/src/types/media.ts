export type MediaType = {
  media_id: number
  filename: string
  filepath: string
  filetype:
    | 'image/jpeg'
    | 'image/jpg'
    | 'image/png'
    | 'video/mp4'
    | 'video/webp'
    | 'image/webp'
    | 'video/mkv'
  description: string | null
  uploader_id: string
  created_at: string
  updated_at: string
}

export type MediaUpload = {
  name: string
  path: string
  description: string | null
}
