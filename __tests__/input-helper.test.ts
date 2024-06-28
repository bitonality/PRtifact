import { expect, jest } from '@jest/globals'
import * as core from '@actions/core'
import {
  getContent,
  parseInputs,
  ActionInput,
  parseNumberOrUseDefault,
  parseStringOrUseDefault
} from '../src/utils/input-helper'
import { parseCommentMode } from '../src/destinations/web-comment'
import * as fs from 'node:fs'

jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'default-owner',
      repo: 'default-repo'
    },
    issue: {
      owner: 'issue-owner',
      repo: 'issue-repo',
      number: 123
    },
    runId: 1001
  }
}))
// Mock the entire module
jest.mock('@actions/core')
;(
  core.getInput as jest.MockedFunction<typeof core.getInput>
).mockImplementation((name: string) => {
  return mockInputs.get(name) ?? ''
})

// Inputs for mock @actions/core

let mockInputs: Map<string, string> = new Map()

class ErrnoException extends Error {
  constructor(
    public code: string,
    public message = ''
  ) {
    super(message)
    Object.setPrototypeOf(this, ErrnoException.prototype)
  }
}
describe('getContent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return file content if input is a valid file path', async () => {
    const mockReadFile = jest
      .spyOn(fs.promises, 'readFile')
      .mockReturnValue(Promise.resolve('file content'))
    const result = await getContent('validFilePath.txt')
    expect(mockReadFile).toHaveBeenCalledWith('validFilePath.txt', {
      encoding: 'utf-8'
    })
    expect(result).toBe('file content')
  })

  it('should return input string if file does not exist (ENOENT)', async () => {
    const error = new ErrnoException('ENOENT', 'File not found')

    const mockReadFile = jest
      .spyOn(fs.promises, 'readFile')
      .mockReturnValue(Promise.reject(error))

    const result = await getContent('nonExistentFilePath.txt')
    expect(mockReadFile).toHaveBeenCalledWith('nonExistentFilePath.txt', {
      encoding: 'utf-8'
    })
    expect(result).toBe('nonExistentFilePath.txt')
  })

  it('should throw an error for other file read errors', async () => {
    const error = new ErrnoException('EACCES', 'Permission denied')
    const mockReadFile = jest
      .spyOn(fs.promises, 'readFile')
      .mockReturnValue(Promise.reject(error))

    await expect(getContent('filePathWithError.txt')).rejects.toThrow(
      'Permission denied'
    )
    expect(mockReadFile).toHaveBeenCalledWith('filePathWithError.txt', {
      encoding: 'utf-8'
    })
  })
})

describe('parseInputs', () => {
  beforeEach(() => {
    mockInputs = new Map<string, string>()
  })

  it('should return default values when inputs are not provided', () => {
    mockInputs.set('github-token', 'TESTTOKEN')
    mockInputs.set('comment-mode', 'Create')
    mockInputs.set('hidden-key', 'hidden-key-value')
    mockInputs.set('separator', '\n')
    const inputs: ActionInput = parseInputs()

    expect(inputs.githubToken).toStrictEqual('TESTTOKEN')
    expect(inputs.workflowRunId).toStrictEqual(1001)
    expect(inputs.issueId).toStrictEqual(123)
    expect(inputs.owner).toStrictEqual('default-owner')
    expect(inputs.repo).toStrictEqual('default-repo')
    expect(inputs.commentMode).toStrictEqual('Create')
    expect(inputs.hiddenKey).toStrictEqual('hidden-key-value')
    expect(inputs.separator).toStrictEqual('\n')
    expect(inputs.handlebarsTemplate).toMatch(/.*templates[/\\]report.hbs$/)
  })

  it('should throw an error for invalid comment mode', () => {
    mockInputs.set('github-token', 'TESTTOKEN')
    mockInputs.set('workflow-run-id', '1001')
    mockInputs.set('issue-id', '123')
    mockInputs.set('owner', 'default-owner')
    mockInputs.set('repo', 'default-repo')
    mockInputs.set('comment-mode', 'InvalidMode')
    mockInputs.set('hidden-key', 'hidden-key-value')
    mockInputs.set('separator', '\n')
    mockInputs.set('handlebarsTemplate', 'handlebars.hbs')

    expect(() => parseInputs()).toThrow(
      'Could not parse comment mode: InvalidMode'
    )
  })
})

describe('parseCommentMode', () => {
  it('should parse valid comment modes correctly', () => {
    expect(parseCommentMode('Create')).toBe('Create')
    expect(parseCommentMode('CreateOrAppend')).toBe('CreateOrAppend')
    expect(parseCommentMode('CreateOrUpdate')).toBe('CreateOrUpdate')
    expect(parseCommentMode('Update')).toBe('Update')
    expect(parseCommentMode('Append')).toBe('Append')
  })

  it('should throw an error for invalid comment modes', () => {
    expect(() => parseCommentMode('InvalidMode')).toThrow(
      'Could not parse comment mode: InvalidMode'
    )
  })
})

describe('parseNumberOrUseDefault', () => {
  it('should return the parsed number when input is a valid number within the range', () => {
    expect(parseNumberOrUseDefault('42', 100, 0, 50)).toBe(42)
    expect(parseNumberOrUseDefault('12345', 100, 1000, 20000)).toBe(12345)
  })

  it('should return the default number when input is NaN', () => {
    expect(parseNumberOrUseDefault('invalid', 100)).toBe(100)
    expect(parseNumberOrUseDefault('', 100)).toBe(100)
    expect(parseNumberOrUseDefault('NaN', 100)).toBe(100)
  })

  it('should return the default number when input is an empty string', () => {
    expect(parseNumberOrUseDefault('', 100)).toBe(100)
  })

  it('should return the default number when input is 0', () => {
    expect(parseNumberOrUseDefault('0', 100)).toBe(100)
  })

  it('should throw a RangeError when parsed number is out of the specified range', () => {
    expect(() => parseNumberOrUseDefault('10', 100, 20, 30)).toThrow(RangeError)
    expect(() => parseNumberOrUseDefault('40', 100, 0, 30)).toThrow(RangeError)
  })

  it('should handle edge cases for number parsing', () => {
    expect(parseNumberOrUseDefault('1e10', 100)).toBe(10000000000)
  })

  it('should throw a RangeError for valid numbers outside the default range', () => {
    expect(() => parseNumberOrUseDefault('1001', 100, 0, 1000)).toThrow(
      RangeError
    )
    expect(() => parseNumberOrUseDefault('-1', 100, 0, 1000)).toThrow(
      RangeError
    )
    expect(() => parseNumberOrUseDefault('Infinity', 100)).toThrow(RangeError)
    expect(() => parseNumberOrUseDefault('-Infinity', 100)).toThrow(RangeError)
  })
})

describe('parseStringOrUseDefault', () => {
  it('should return the input string when it is not empty', () => {
    expect(parseStringOrUseDefault('valid string', 'default')).toBe(
      'valid string'
    )
    expect(parseStringOrUseDefault('another string', 'default')).toBe(
      'another string'
    )
    expect(parseStringOrUseDefault('12345', 'default')).toBe('12345')
  })

  it('should return the default string when input is an empty string', () => {
    expect(parseStringOrUseDefault('', 'default')).toBe('default')
  })

  it('should return the input string when it is a whitespace', () => {
    expect(parseStringOrUseDefault(' ', 'default')).toBe(' ')
    expect(parseStringOrUseDefault('\t', 'default')).toBe('\t')
    expect(parseStringOrUseDefault('\n', 'default')).toBe('\n')
  })

  it('should return the input string when it is a numeric string', () => {
    expect(parseStringOrUseDefault('123', 'default')).toBe('123')
    expect(parseStringOrUseDefault('0', 'default')).toBe('0')
  })

  it('should handle special characters in the input string', () => {
    expect(parseStringOrUseDefault('@!#$', 'default')).toBe('@!#$')
    expect(parseStringOrUseDefault('🔥', 'default')).toBe('🔥')
  })
})
