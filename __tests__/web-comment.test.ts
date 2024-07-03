import { jest } from '@jest/globals'
import { GitHub } from '@actions/github/lib/utils'
type Octokit = InstanceType<typeof GitHub>
import {
  GitHubCommentAppendStrategy,
  GitHubCommentCreateOrAppendStrategy,
  GitHubCommentCreateOrUpdateStrategy,
  GitHubCommentCreateStrategy,
  GitHubCommentUpdateStrategy
} from '../src/destinations/github/github-strategies'
import { createGitHubWebStrategy } from '../src/destinations/web-comment'

import fetchMock from 'fetch-mock'

jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'mock-owner',
      repo: 'mock-repo'
    }
  }
}))

describe('createGitHubWebStrategy', () => {
  const issue = 1
  const hiddenKey = 'hidden-key'
  const separator = '\n'
  const owner = 'custom-owner'
  const repo = 'custom-repo'

  let mock: typeof fetchMock
  let octokit: Octokit
  beforeEach(() => {
    mock = fetchMock.sandbox()
    octokit = new GitHub({ request: { fetch: mock } })
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should create a GitHubCommentCreateStrategy when commentMode is "Create"', () => {
    const strategy = createGitHubWebStrategy(
      octokit,
      issue,
      'Create',
      hiddenKey,
      owner,
      repo,
      separator
    )
    expect(strategy).toBeInstanceOf(GitHubCommentCreateStrategy)
    expect(strategy).toEqual(
      new GitHubCommentCreateStrategy(octokit, issue, owner, repo, hiddenKey)
    )
  })

  it('should create a GitHubCommentCreateOrAppendStrategy when commentMode is "CreateOrAppend"', () => {
    const strategy = createGitHubWebStrategy(
      octokit,
      issue,
      'CreateOrAppend',
      hiddenKey,
      owner,
      repo,
      separator
    )
    expect(strategy).toBeInstanceOf(GitHubCommentCreateOrAppendStrategy)
    expect(strategy).toEqual(
      new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
    )
  })

  it('should create a GitHubCommentCreateOrUpdateStrategy when commentMode is "CreateOrUpdate"', () => {
    const strategy = createGitHubWebStrategy(
      octokit,
      issue,
      'CreateOrUpdate',
      hiddenKey,
      owner,
      repo,
      separator
    )
    expect(strategy).toBeInstanceOf(GitHubCommentCreateOrUpdateStrategy)
    expect(strategy).toEqual(
      new GitHubCommentCreateOrUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
    )
  })

  it('should create a GitHubCommentUpdateStrategy when commentMode is "Update"', () => {
    const strategy = createGitHubWebStrategy(
      octokit,
      issue,
      'Update',
      hiddenKey,
      owner,
      repo,
      separator
    )
    expect(strategy).toBeInstanceOf(GitHubCommentUpdateStrategy)
    expect(strategy).toEqual(
      new GitHubCommentUpdateStrategy(octokit, issue, owner, repo, hiddenKey)
    )
  })

  it('should create a GitHubCommentAppendStrategy when commentMode is "Append"', () => {
    const strategy = createGitHubWebStrategy(
      octokit,
      issue,
      'Append',
      hiddenKey,
      owner,
      repo,
      separator
    )
    expect(strategy).toBeInstanceOf(GitHubCommentAppendStrategy)
    expect(strategy).toEqual(
      new GitHubCommentAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
    )
  })
})
