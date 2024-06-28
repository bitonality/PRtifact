import { URL } from 'node:url'

/**
 * Base URL for shields.io badges.
 */
const shieldsIoBaseUrl: URL = new URL(`https://img.shields.io/badge/`)

/**
 * Converts a size in bytes into a human-readable string.
 * @param bytes - The size in bytes.
 * @returns A human-readable string representing the size.
 */
export function humanReadableSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const decimals = 2
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)).toString()} ${sizes[i]}`
}

/**
 * Transforms special characters in shields.io URL strings into correctly escaped sequences.
 * @param badgeName - Name to display on the badge.
 * @returns Escaped badge name that can be safely used in shields.io URLs.
 */
export function shieldsIoBadgeTransform(badgeName: string): string {
  return badgeName
    .replaceAll(/-/g, '--')
    .replaceAll(/\s/g, '%20')
    .replaceAll(/_/g, '__')
}

/**
 * Generates a shields.io badge in markdown format.
 * @param badgeName - The name to display on the badge.
 * @param badgeColor - The color of the badge.
 * @param logo - Optional logo to include on the badge.
 * @returns Markdown format badge.
 */
export function shieldsIoBadge(
  badgeName: string,
  badgeColor: string,
  logo?: string
): string {
  const badgeTransformedName = shieldsIoBadgeTransform(badgeName)
  const nameWithColor = badgeTransformedName.concat('-', badgeColor.toString())
  const badgeUrl = new URL(nameWithColor, shieldsIoBaseUrl)
  badgeUrl.searchParams.append('style', 'for-the-badge')
  if (logo !== undefined) {
    badgeUrl.searchParams.append('logo', logo)
  }

  return `![${badgeName}](${badgeUrl.toString()})`
}

/**
 * Converts a date string into a human-readable format.
 * @param dateString - The date string to convert.
 * @returns A human-readable date string.
 */
export function humanReadableDate(dateString: string): string {
  const date = Date.parse(dateString)
  return dateTimeFormat.format(date)
}

/**
 * {@link Intl.DateTimeFormat} for human-readability in UTC time zone.
 */
const dateTimeFormat = new Intl.DateTimeFormat('default', {
  month: 'short',
  day: 'numeric',
  year: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'utc',
  timeZoneName: 'short'
})
