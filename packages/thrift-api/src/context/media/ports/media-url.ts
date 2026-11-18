export type MediaUrl = {
  url(
    filename: string,
    filetype?: string,
    folder?: 'products' | 'avatars',
  ): string | Promise<string>
}
