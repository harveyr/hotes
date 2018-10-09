import * as dateFns from 'date-fns'

export function ageInSeconds(d: Date): number {
  return dateFns.differenceInSeconds(new Date(), d)
}

export function ageInMilliseconds(d: Date): number {
  return dateFns.differenceInMilliseconds(new Date(), d)
}

export function humanizedDistance(d: Date): string {
  return dateFns.formatDistance(d, new Date())
}

export function humanizedRelative(d: Date): string {
  return dateFns.formatRelative(d, new Date())
}
