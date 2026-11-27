export function loginDestination(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\x00-\x1f]/.test(value) ||
    value.split('?')[0].startsWith('/auth/')
  )
    return '/'
  return value
}
