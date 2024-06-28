import { getContent } from '../utils/input-helper'
import handlebars from 'handlebars'
import { Context } from '@actions/github/lib/context'
import { ReportProcessor, Artifact } from '../index'
type Handlebars = typeof handlebars

/**
 * Class to generate reports using Handlebars templates.
 * Implements the ReportProcessor interface for string reports.
 */
export default class HandlebarsReportGenerator
  implements ReportProcessor<string>
{
  private template: string
  private handlebars: Handlebars
  private context: Context

  /**
   * Creates an instance of HandlebarsReportGenerator.
   * @param template - The template file path or literal string to use for generating the report.
   * @param handlebarsInstance - An instance of Handlebars. Any handlebars helpers must be registered
   * with the passed in handlebars instance.
   * @param context - The GitHub Actions context.
   */
  constructor(
    template: string,
    handlebarsInstance: Handlebars,
    context: Context
  ) {
    this.template = template
    this.handlebars = handlebarsInstance
    this.context = context
  }

  /**
   * Generates a report based on the provided artifacts.
   * @param artifacts - An array of artifacts to include in the report.
   * @returns A promise that resolves to the generated report as a string.
   */
  async generateReport(artifacts: readonly Artifact[]): Promise<string> {
    const loadedTemplate = await getContent(this.template)
    const template = this.handlebars.compile(loadedTemplate)

    const workflowRunUrl: URL = new URL(
      [
        this.context.repo.owner,
        this.context.repo.repo,
        'actions',
        'runs',
        this.context.runId.toString()
      ].join('/'),
      this.context.serverUrl
    )
    const populatedContext = {
      ...this.context,
      issue: this.context.issue,
      repo: this.context.repo
    }
    const renderedTemplate = template({
      artifacts: artifacts,
      context: populatedContext,
      workflowRunUrl: workflowRunUrl.toString()
    })
    return renderedTemplate
  }
}
