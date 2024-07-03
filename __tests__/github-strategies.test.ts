import { GitHub } from '@actions/github/lib/utils'
type Octokit = InstanceType<typeof GitHub>
import {
  GitHubCommentCreateStrategy,
  GitHubCommentUpdateStrategy,
  GitHubCommentCreateOrUpdateStrategy,
  GitHubCommentAppendStrategy,
  GitHubCommentCreateOrAppendStrategy,
  GitHubWebCommentStrategy
} from '../src/destinations/github/github-strategies'
import { components } from '@octokit/openapi-types/types'

import fetchMock from 'fetch-mock'

type Comment = components['schemas']['issue-comment']

class ConcreteGitHubWebCommentStrategy extends GitHubWebCommentStrategy {
  async uploadReport(_report: string): Promise<void> {
    // Implement a no-op for testing purposes
  }
}

describe('GitHubCommentStrategy base class common functions', () => {
  const owner = 'test-owner'
  const repo = 'test-repo'
  const issue = 1
  const hiddenKey = 'hidden-key'
  let existingComment: Comment
  let baseStrategyClass: ConcreteGitHubWebCommentStrategy
  let mock: typeof fetchMock
  let octokit: Octokit
  beforeEach(() => {
    mock = fetchMock.sandbox()
    octokit = new GitHub({ request: { fetch: mock } })
    baseStrategyClass = new ConcreteGitHubWebCommentStrategy(
      octokit,
      issue,
      owner,
      repo,
      hiddenKey
    )
    existingComment = { id: 1, body: 'existing-comment' } as Comment
  })

  describe('createComment', () => {
    it('should create a comment', async () => {
      mock.postOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        201
      )
      await baseStrategyClass.createComment('test-comment')
      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
          'POST'
        )
      ).toBe(true)
    })
  })

  describe('updateComment', () => {
    it('should update a comment', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )
      await baseStrategyClass.updateComment(1, 'updated-comment')
      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })
  })

  describe('getComment', () => {
    it('should return a comment containing the hiddenKey', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      const result = await baseStrategyClass.getComment(hiddenKey)
      expect(result).toEqual(existingComment)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })

    it('should return undefined if no comment contains the hiddenKey', async () => {
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        []
      )

      const result = await baseStrategyClass.getComment(hiddenKey)
      expect(result).toBeUndefined()
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })

    it('should throw an error if multiple comments contain the hiddenKey', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment, existingComment]
      )
      await expect(baseStrategyClass.getComment(hiddenKey)).rejects.toThrow(
        'Multiple comments found with the same hiddenKey.'
      )
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })

    it('should throw error if no hidden key provided', async () => {
      await expect(baseStrategyClass.getComment('')).rejects.toThrow()

      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(false)
    })
  })
})

describe('GitHub Comment Strategies', () => {
  const owner = 'test-owner'
  const repo = 'test-repo'
  const issue = 1
  const hiddenKey = 'hidden-key'
  const separator = '\n'
  const report = 'test-report'

  let existingComment: Comment
  let mock: typeof fetchMock
  let octokit: Octokit
  beforeEach(() => {
    mock = fetchMock.sandbox()
    octokit = new GitHub({ request: { fetch: mock } })
    existingComment = {
      id: 123,
      body: 'existing comment'
    } as Comment
  })

  afterEach(() => {
    fetchMock.restore()
  })

  describe('GitHubCommentCreateStrategy', () => {
    it('should create a comment', async () => {
      mock.postOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        201
      )

      const strategy = new GitHubCommentCreateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
          {
            method: 'POST'
          }
        )
      ).toBe(true)
    })
  })

  describe('GitHubCommentUpdateStrategy', () => {
    it('should update an existing comment', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)

      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )

      const strategy = new GitHubCommentUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })

    it('should throw an error if no comment is found', async () => {
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        []
      )

      const strategy = new GitHubCommentUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
      await expect(strategy.uploadReport(report)).rejects.toThrow(
        'Unable to find comment with specified hiddenKey.'
      )

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })
  })

  describe('GitHubCommentCreateOrUpdateStrategy', () => {
    it('should update an existing comment', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )

      const strategy = new GitHubCommentCreateOrUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })

    it('should create a new comment if no comment is found', async () => {
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        []
      )

      mock.postOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        201
      )

      const strategy = new GitHubCommentCreateOrUpdateStrategy(
        octokit,
        issue,
        owner,
        repo,
        hiddenKey
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
          {
            method: 'POST'
          }
        )
      ).toBe(true)
    })
  })

  describe('GitHubCommentAppendStrategy', () => {
    it('should append to an existing comment', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )

      const strategy = new GitHubCommentAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })

    it('should throw an error if no comment is found', async () => {
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        []
      )

      const strategy = new GitHubCommentAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      await expect(strategy.uploadReport(report)).rejects.toThrow(
        'Unable to find comment with specified hiddenKey.'
      )

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })
  })

  describe('GitHubCommentCreateOrAppendStrategy', () => {
    it('should append to an existing comment', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )

      const strategy = new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })

    it('should create a new comment if no comment is found', async () => {
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        []
      )

      mock.postOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        201
      )

      const strategy = new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
          {
            method: 'POST'
          }
        )
      ).toBe(true)
    })

    it('should throw if multiple comments with same hidden key', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment, existingComment]
      )

      const strategy = new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      const task = strategy.uploadReport(report)
      await expect(task).rejects.toThrow(
        'Multiple comments found with the same hiddenKey.'
      )
      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
    })

    it('should handle transient', async () => {
      existingComment.body = hiddenKey + (existingComment.body as string)
      mock.getOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`,
        [existingComment]
      )

      mock.patchOnce(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`,
        200
      )

      const strategy = new GitHubCommentCreateOrAppendStrategy(
        octokit,
        issue,
        hiddenKey,
        separator,
        owner,
        repo
      )
      await strategy.uploadReport(report)

      expect(mock.called()).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/${issue.toString()}/comments`
        )
      ).toBe(true)
      expect(
        mock.called(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingComment.id.toString()}`
        )
      ).toBe(true)
    })
  })
})
