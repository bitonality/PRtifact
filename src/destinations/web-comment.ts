import { GitHub } from '@actions/github/lib/utils'
type Octokit = InstanceType<typeof GitHub>
import {
  GitHubWebCommentStrategy,
  GitHubCommentAppendStrategy,
  GitHubCommentCreateOrAppendStrategy,
  GitHubCommentCreateOrUpdateStrategy,
  GitHubCommentCreateStrategy,
  GitHubCommentUpdateStrategy
} from '../destinations/github/github-strategies'

const CommentModesArray = [
  'Create',
  'CreateOrAppend',
  'CreateOrUpdate',
  'Update',
  'Append'
] as const
export type CommentMode = (typeof CommentModesArray)[number]

/**
 *
 * @param octokit - Hydrated octokit instance to make web requests from.
 * @param issue - Issue number. This can be a pull request number or an issue number.
 * @param commentMode - {@link CommentMode} to use.
 * @param hiddenKey - A hidden string that is used for finding existing comments.
 * We use the hidden key as a mechanism to determine which comment we should operate on when updating or appending to a comment.
 * @param owner - Repository owner. Used for web request URL creation. Example: https://github.com/<owner>/<repo>
 * @param repo - Repository . Used for web request URL creation. Example: https://github.com/<owner>/<repo>
 * @param separator - Separator to use when appending to an existing comment.
 * The separator will be inserted between the existing comment body and the text that will be appended.
 * @returns
 */
export function createGitHubWebStrategy(
  octokit: Octokit,
  issue: number,
  commentMode: CommentMode,
  hiddenKey: string,
  owner: string,
  repo: string,
  separator: string
): GitHubWebCommentStrategy {
  switch (commentMode) {
    case 'Create':
      return new GitHubCommentCreateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
    case 'CreateOrAppend':
      return new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
    case 'CreateOrUpdate':
      return new GitHubCommentCreateOrUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
    case 'Update':
      return new GitHubCommentUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
    case 'Append':
      return new GitHubCommentAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
  }
}

/**
 * Parses a string to determine if it is a valid {@link CommentMode}.
 * @param maybeCommentMode - The string to parse as a {@link CommentMode}.
 * @returns The corresponding {@link CommentMode} if valid.
 * @throws Error if the provided string does not match any valid {@link CommentMode}.
 */
export function parseCommentMode(maybeCommentMode: string): CommentMode {
  const commentMode = CommentModesArray.find(
    validName => validName === maybeCommentMode
  )
  if (commentMode) {
    return commentMode
  }
  throw new Error(`Could not parse comment mode: ${maybeCommentMode}`)
}
