import { ReportDestination } from '../index'
import * as core from '@actions/core'
/**
 * Native console destination is a thin wrapper for console.log().
 * This is intended to be used in local tests/unit tests, but could also be used
 * within the PRtifact action.
 */
export class NativeConsoleDestination implements ReportDestination<string> {
  async uploadReport(report: string): Promise<void> {
    console.log(report)
    await Promise.resolve()
  }
}

/**
 * GitHub console report destination.
 * This uses the @actions/core API to create a log group and print in that log group.
 */
export class GitHubConsoleDestination implements ReportDestination<string> {
  async uploadReport(report: string): Promise<void> {
    core.startGroup('artifactGroup')
    core.info(report)
    core.endGroup()
    await Promise.resolve()
  }
}
