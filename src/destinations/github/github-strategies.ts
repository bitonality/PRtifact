import { GitHub } from '@actions/github/lib/utils'
type Octokit = InstanceType<typeof GitHub>
import { ReportDestination, Comment } from '../../index'
// Import types for TSDoc.
import type { createGitHubWebStrategy as _createGitHubWebStrategy } from '../web-comment'

/**
 * Abstract base class for GitHub web comment strategies.
 * Implements the ReportDestination interface for string reports.
 * You likely shouldn't create new instances of {@link GitHubWebCommentStrategy}.
 * Instead, you should use the {@link _createGitHubWebStrategy | createGitHubWebStrategy} factory function.
 */
export abstract class GitHubWebCommentStrategy
  implements ReportDestination<string>
{
  private readonly octokit: Octokit
  private readonly issue: number
  private readonly owner: string
  private readonly repo: string
  protected readonly hiddenKey: string

  /**
   * Creates an instance of GitHubWebCommentStrategy.
   * @param octokit - An instance of Octokit.
   * @param issue - The issue number. This is a PR number or an Issue number.
   * @param owner - The repository owner.
   * @param repo - The repository name.
   * @param hiddenKey - The hidden key used to identify the comment.
   */
  constructor(
    octokit: Octokit,
    issue: number,
    owner: string,
    repo: string,
    hiddenKey: string
  ) {
    this.octokit = octokit
    this.issue = issue
    this.owner = owner
    this.repo = repo
    this.hiddenKey = hiddenKey
  }

  /**
   * Abstract method to upload a report. Must be implemented by subclasses.
   * @param report - The report to upload.
   * @returns A promise that resolves once the report is uploaded.
   */
  abstract uploadReport(report: string): Promise<void>

  /**
   * Creates a new comment on the issue.
   * The {@link hiddenKey} will be appended to the beginning of the comment body.
   * @param commentBody - The body of the comment.
   * @returns A promise that resolves once the comment is created.
   */
  async createComment(commentBody: string): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.issue,
      body: `${this.hiddenKey}\n`.concat(commentBody)
    })
  }

  /**
   * Updates an existing comment on the issue.
   * @param commentId - The ID of the comment to update.
   * The {@link hiddenKey} will be appended to the beginning of the updated comment body.
   * @param commentBody - The new body of the comment.
   * @returns A promise that resolves once the comment is updated.
   */
  async updateComment(commentId: number, commentBody: string): Promise<void> {
    await this.octokit.rest.issues.updateComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentId,
      body: `${this.hiddenKey}\n`.concat(commentBody)
    })
  }

  /**
   * Retrieves a comment with the specified hidden key.
   * @param hiddenKey - The hidden key to search for in comments.
   * @returns A promise that resolves to the found comment, or undefined if no comment is found.
   * @throws Error if no hidden key is provided or multiple comments are found with the same hidden key.
   */
  async getComment(hiddenKey: string): Promise<Comment | undefined> {
    if (!hiddenKey) {
      throw new Error('No hidden key provided.')
    }
    const foundComments: Comment[] = []
    for await (const page of this.octokit.paginate.iterator(
      this.octokit.rest.issues.listComments,
      { owner: this.owner, repo: this.repo, issue_number: this.issue }
    )) {
      const commentsInPage = page.data.filter(({ body }) =>
        body?.toLowerCase().includes(hiddenKey.toLowerCase())
      )
      for (const foundComment of commentsInPage) {
        foundComments.push(foundComment)
      }
    }
    if (foundComments.length === 1) {
      return foundComments[0]
    } else if (foundComments.length > 1) {
      throw new Error('Multiple comments found with the same hiddenKey.')
    } else {
      return undefined
    }
  }
}

/**
 * Strategy for creating a new comment on a GitHub issue or pull request.
 */
export class GitHubCommentCreateStrategy extends GitHubWebCommentStrategy {
  /**
   * Uploads a report by creating a new comment.
   * @param report - The report to upload.
   * @returns A promise that resolves once the comment is created.
   */
  async uploadReport(report: string): Promise<void> {
    await this.createComment(report)
  }
}

/**
 * Strategy for updating an existing comment on a GitHub issue or pull request.
 */
export class GitHubCommentUpdateStrategy extends GitHubWebCommentStrategy {
  /**
   * Uploads a report by updating an existing comment.
   * @param report - The report to upload.
   * @returns A promise that resolves once the comment is updated.
   * @throws Error if no comment is found with the specified hidden key.
   */
  async uploadReport(report: string): Promise<void> {
    const comment = await this.getComment(this.hiddenKey)
    if (comment !== undefined) {
      await this.updateComment(comment.id, report)
    } else {
      throw new Error('Unable to find comment with specified hiddenKey.')
    }
  }
}

/**
 * Strategy for creating a new comment or updating an existing one on a GitHub issue or pull request.
 */
export class GitHubCommentCreateOrUpdateStrategy extends GitHubWebCommentStrategy {
  /**
   * Uploads a report by creating a new comment or updating an existing one.
   * @param report - The report to upload.
   * @returns A promise that resolves once the comment is created or updated.
   */
  async uploadReport(report: string): Promise<void> {
    const comment = await this.getComment(this.hiddenKey)
    if (comment !== undefined) {
      await this.updateComment(comment.id, report)
    } else {
      await this.createComment(report)
    }
  }
}

/**
 * Strategy for appending to an existing comment on a GitHub issue or pull request.
 */
export class GitHubCommentAppendStrategy extends GitHubWebCommentStrategy {
  private separator: string

  /**
   * Creates an instance of GitHubCommentAppendStrategy.
   * @param octokit - An instance of Octokit.
   * @param issue - The issue number.
   * @param hiddenKey - The hidden key used to identify the comment.
   * @param separator - The separator to append between the existing comment body and the new comment body content.
   * @param owner - The repository owner.
   * @param repo - The repository name.
   */
  constructor(
    octokit: Octokit,
    issue: number,
    hiddenKey: string,
    separator: string,
    owner: string,
    repo: string
  ) {
    super(octokit, issue, owner, repo, hiddenKey)
    this.separator = separator
  }

  /**
   * Uploads a report by appending to an existing comment.
   * @param report - The report to upload.
   * @returns A promise that resolves once the comment is appended.
   * @throws Error if no comment is found with the specified hidden key.
   */
  async uploadReport(report: string): Promise<void> {
    const comment = await this.getComment(this.hiddenKey)
    if (comment !== undefined) {
      const commentBody = comment.body ?? ''
      const appendedReport = commentBody.concat(this.separator, report)
      await this.updateComment(comment.id, appendedReport)
    } else {
      throw new Error('Unable to find comment with specified hiddenKey.')
    }
  }
}

/**
 * Strategy for creating a new comment or appending to an existing one on GitHub.
 */
export class GitHubCommentCreateOrAppendStrategy extends GitHubWebCommentStrategy {
  private separator: string

  /**
   * Creates an instance of GitHubCommentCreateOrAppendStrategy.
   * @param octokit - An instance of Octokit.
   * @param issue - The issue number.
   * @param hiddenKey - The hidden key used to identify the comment.
   * @param separator - The separator to use when appending to the comment.
   * @param owner - The repository owner.
   * @param repo - The repository name.
   */
  constructor(
    octokit: Octokit,
    issue: number,
    hiddenKey: string,
    separator: string,
    owner: string,
    repo: string
  ) {
    super(octokit, issue, owner, repo, hiddenKey)
    this.separator = separator
  }

  /**
   * Uploads a report by creating a new comment or appending to an existing one.
   * @param report - The report to upload.
   * @returns A promise that resolves once the comment is created or appended.
   */
  async uploadReport(report: string): Promise<void> {
    const comment = await this.getComment(this.hiddenKey)
    if (comment !== undefined) {
      const commentBody = comment.body ?? ''
      const appendedReport = commentBody.concat(this.separator, report)
      await this.updateComment(comment.id, appendedReport)
    } else {
      await this.createComment(report)
    }
  }
}
