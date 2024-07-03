import { jest } from '@jest/globals'
import { Table } from 'console-table-printer'
import { TablePrinterProcessor } from '../src/preprocessor/table-printer'
import { Artifact } from '../src/index'

jest.mock('console-table-printer')

describe('TablePrinterProcessor', () => {
  let tableProcessor: TablePrinterProcessor

  beforeEach(() => {
    tableProcessor = new TablePrinterProcessor()
  })

  it('should print artifacts correctly', async () => {
    const artifacts: Artifact[] = [
      {
        id: 1,
        node_id: 'MDEwOkNoZWNrU3VpdGU1',
        name: 'TestArtifact.SomePayload',
        size_in_bytes: 12345,
        url: 'https://api.github.com/repos/github/hello-world/actions/artifacts/5',
        archive_download_url:
          'https://api.github.com/repos/github/hello-world/actions/artifacts/5/zip',
        expired: false,
        created_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-06-01T00:00:00Z',
        updated_at: '2023-05-01T00:00:00Z',
        workflow_run: {
          id: 101,
          repository_id: 42,
          head_repository_id: 42,
          head_branch: 'main',
          head_sha: '009b8a3a9ccbb128af87f9b1c0f4c62e8a304f6d'
        }
      } as Artifact
    ]

    await tableProcessor.generateReport(artifacts)

    const tableInstance = (Table as jest.Mocked<typeof Table>).mock.instances[0]
    expect(tableInstance.addRow).toHaveBeenCalled()
    expect(tableInstance.render).toHaveBeenCalled()
  })
})
