export const stripFirst = (str: string) => {
  if (str.split(/\s+/).length <= 1) return ''
  return str.replace(/^\S+\s+/, '').trim()
}
