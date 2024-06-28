import {
  NativeConsoleDestination,
  GitHubConsoleDestination
} from '../src/destinations/console' // Adjust the import path accordingly
import * as core from '@actions/core'

describe('NativeConsoleDestination', () => {
  let consoleLogSpy: jest.SpyInstance

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterAll(() => {
    consoleLogSpy.mockRestore()
  })

  test('should log the report to console', async () => {
    const destination = new NativeConsoleDestination()
    const report = 'Test Report'

    await destination.uploadReport(report)

    expect(consoleLogSpy).toHaveBeenCalledWith(report)
  })
})

jest.mock('@actions/core', () => ({
  startGroup: jest.fn(),
  info: jest.fn(),
  endGroup: jest.fn()
}))

describe('GitHubConsoleDestination', () => {
  test('should log the report to GitHub actions console', async () => {
    const destination = new GitHubConsoleDestination()
    const report = 'Test Report'

    await destination.uploadReport(report)

    expect(core.startGroup).toHaveBeenCalledWith('artifactGroup')
    expect(core.info).toHaveBeenCalledWith(report)
    expect(core.endGroup).toHaveBeenCalled()
  })
})
