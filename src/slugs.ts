import _slugify from 'slugify'

export function slugify(s: string): string {
  return _slugify(s, {
    replacement: '-',
    remove: /[*+~.()'"!:@/]/g,
    lower: true,
  })
}
