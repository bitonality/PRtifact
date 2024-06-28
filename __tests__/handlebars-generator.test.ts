import HandlebarsReportGenerator from '../src/preprocessor/handlebar-generator'
import { getContent } from '../src/utils/input-helper'
import handlebars from 'handlebars'
import { Context } from '@actions/github/lib/context'
import { Artifact } from '../src/index'

// Mock the getContent function
jest.mock('../src/utils/input-helper')

describe('HandlebarsReportGenerator', () => {
  let context: Context
  let artifacts: Artifact[]
  let template: string
  let handlebarsInstance: typeof handlebars

  beforeEach(() => {
    context = {
      repo: {
        owner: 'owner',
        repo: 'repo'
      },
      runId: 123,
      serverUrl: 'https://github.com'
    } as Context

    artifacts = [
      {
        id: 1,
        name: 'artifact1',
        size_in_bytes: 123,
        url: 'http://example.com',
        archive_download_url: 'http://example.com/download',
        expired: false,
        created_at: '2023-01-01T00:00:00Z',
        expires_at: '2024-01-01T00:00:00Z',
        updated_at: '2023-06-01T00:00:00Z',
        workflow_run: {
          id: 2,
          repository_id: 3,
          head_repository_id: 4,
          head_branch: 'main',
          head_sha: 'abcd1234'
        }
      } as Artifact
    ]

    template = 'template content'
    handlebarsInstance = handlebars.create()
  })

  test('constructor sets properties correctly', () => {
    const generator = new HandlebarsReportGenerator(
      template,
      handlebarsInstance,
      context
    )

    expect(generator['template']).toBe(template)
    expect(generator['handlebars']).toBe(handlebarsInstance)
    expect(generator['context']).toBe(context)
  })

  test('generateReport calls getContent and compiles template', async () => {
    const generator = new HandlebarsReportGenerator(
      template,
      handlebarsInstance,
      context
    )
    const compiledTemplate = jest.fn().mockReturnValue('rendered content')
    handlebarsInstance.compile = jest.fn().mockReturnValue(compiledTemplate)
    ;(getContent as jest.Mock).mockResolvedValue('loaded template content')

    const result = await generator.generateReport(artifacts)

    expect(getContent).toHaveBeenCalledWith(template)
    expect(handlebarsInstance.compile).toHaveBeenCalledWith(
      'loaded template content'
    )

    expect(compiledTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        artifacts: artifacts,
        context: context,
        workflowRunUrl: 'https://github.com/owner/repo/actions/runs/123'
      })
    )
    expect(result).toBe('rendered content')
  })
})
