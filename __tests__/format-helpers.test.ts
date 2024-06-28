import {
  humanReadableSize,
  humanReadableDate,
  shieldsIoBadgeTransform,
  shieldsIoBadge
} from '../src/utils/format-helpers'

const shieldsIoBaseUrl: URL = new URL('https://img.shields.io/badge/')

describe('shieldsIoBadge', () => {
  test('generates badge URL without logo', () => {
    const badgeUrl = shieldsIoBadge('badge-name', 'green')
    expect(badgeUrl).toBe(
      `![badge-name](${new URL('badge--name-green', shieldsIoBaseUrl).toString()}?style=for-the-badge)`
    )
  })

  test('generates badge URL with logo', () => {
    const badgeUrl = shieldsIoBadge('badge-name', 'green', 'github')
    expect(badgeUrl).toBe(
      `![badge-name](${new URL('badge--name-green', shieldsIoBaseUrl).toString()}?style=for-the-badge&logo=github)`
    )
  })

  test('handles special characters in the badge name', () => {
    const badgeUrl = shieldsIoBadge('badge name_example', 'blue')
    expect(badgeUrl).toBe(
      `![badge name_example](${new URL('badge%20name__example-blue', shieldsIoBaseUrl).toString()}?style=for-the-badge)`
    )
  })

  test('handles empty string as the logo', () => {
    const badgeUrl = shieldsIoBadge('badge-name', 'green', '')
    expect(badgeUrl).toBe(
      `![badge-name](${new URL('badge--name-green', shieldsIoBaseUrl).toString()}?style=for-the-badge&logo=)`
    )
  })

  test('handles badge color transformation', () => {
    const badgeUrl = shieldsIoBadge('badge-name', 'red')
    expect(badgeUrl).toBe(
      `![badge-name](${new URL('badge--name-red', shieldsIoBaseUrl).toString()}?style=for-the-badge)`
    )
  })
})
describe('Utility Functions', () => {
  describe('humanReadableSize', () => {
    test('returns "0 Bytes" for 0 bytes', () => {
      expect(humanReadableSize(0)).toBe('0 Bytes')
    })

    test('returns correct size for bytes less than 1 KB', () => {
      expect(humanReadableSize(512)).toBe('512 Bytes')
    })

    test('returns correct size for bytes in KB range', () => {
      expect(humanReadableSize(1024)).toBe('1 KB')
      expect(humanReadableSize(1536)).toBe('1.5 KB')
    })

    test('returns correct size for bytes in MB range', () => {
      expect(humanReadableSize(1048576)).toBe('1 MB')
      expect(humanReadableSize(1572864)).toBe('1.5 MB')
    })

    test('returns correct size for bytes in GB range', () => {
      expect(humanReadableSize(1073741824)).toBe('1 GB')
      expect(humanReadableSize(1610612736)).toBe('1.5 GB')
    })

    test('returns correct size for bytes in TB range', () => {
      expect(humanReadableSize(1099511627776)).toBe('1 TB')
      expect(humanReadableSize(1649267441664)).toBe('1.5 TB')
    })
  })

  describe('humanReadableDate', () => {
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

    test('returns correctly formatted date', () => {
      const date = new Date(Date.UTC(2023, 5, 15, 12, 30, 45)) // June 15, 2023, 12:30:45 UTC
      expect(humanReadableDate(date.toUTCString())).toBe(
        dateTimeFormat.format(date)
      )
    })

    test('returns correctly formatted date with different time', () => {
      const date = new Date(Date.UTC(2024, 10, 5, 8, 15, 30)) // November 5, 2024, 08:15:30 UTC
      expect(humanReadableDate(date.toUTCString())).toBe(
        dateTimeFormat.format(date)
      )
    })
  })

  describe('shieldsIoBadgeTransform', () => {
    test('replaces dashes with double dashes', () => {
      expect(shieldsIoBadgeTransform('badge-name')).toBe('badge--name')
    })

    test('replaces spaces with %20', () => {
      expect(shieldsIoBadgeTransform('badge name')).toBe('badge%20name')
    })

    test('replaces underscores with double underscores', () => {
      expect(shieldsIoBadgeTransform('badge_name')).toBe('badge__name')
    })

    test('replaces combination of dashes, spaces, and underscores', () => {
      expect(shieldsIoBadgeTransform('badge-name example_badge')).toBe(
        'badge--name%20example__badge'
      )
    })

    test('returns same string if no characters to replace', () => {
      expect(shieldsIoBadgeTransform('badgename')).toBe('badgename')
    })
  })
})
