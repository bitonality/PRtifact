import { components } from '@octokit/openapi-types/types'
import { Artifact, ReportProcessor } from '../index'
import { Table } from 'console-table-printer'

export type WorkflowRun = components['schemas']['artifact']['workflow_run']

/**
 * This class directly generates a string table of artifacts to the console using the console-table-printer package.
 * @see {@link Table} from console-table-printer.
 * @remarks
 * We use the console-table-printer package to pretty-print the artifacts.
 */
export class TablePrinterProcessor implements ReportProcessor<string> {
  async generateReport(artifacts: readonly Artifact[]): Promise<string> {
    const tables: string[] = []
    for (const artifact of artifacts) {
      const table: Table = new Table(['Name', 'Information'])
      let prop: keyof typeof artifact
      for (prop in artifact) {
        if (prop === 'workflow_run') {
          const workflowRun = artifact[prop]
          if (workflowRun && workflowRun.id) {
            table.addRow({
              Name: 'workflow_run_id',
              Information: workflowRun.id
            })
          }
        } else {
          table.addRow({ Name: prop, Information: artifact[prop] })
        }
      }

      tables.push(table.render())
    }

    return Promise.resolve(tables.join('\n'))
  }
}
