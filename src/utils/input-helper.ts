import * as fs from 'fs'
import * as github from '@actions/github'
import * as core from '@actions/core'
import { CommentMode, parseCommentMode } from '../destinations/web-comment'
import { HandlebarsTemplatePath } from '../index'

/**
 * Get the content either from the input string directly or by reading a file.
 * @param input - The input string or file path.
 * @returns A promise that resolves to the content string.
 */
export async function getContent(input: string): Promise<string> {
  try {
    return await fs.promises.readFile(input, { encoding: 'utf-8' })
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      console.info(error.message)
      if (error.code === 'ENOENT') {
        console.info(
          'Unable to load file. Treating handlebars template as a string literal template.'
        )
        return input
      }
    }
    throw error
  }
}

export type ActionInput = {
  githubToken: string
  workflowRunId: number
  issueId: number
  owner: string
  repo: string
  commentMode: CommentMode
  hiddenKey: string
  separator: string
  handlebarsTemplate: string
}

/**
 * Parses inputs from GitHub Actions and returns an ActionInput object.
 * @returns An ActionInput object containing parsed input values.
 */
export function parseInputs(): ActionInput {
  return {
    githubToken: core.getInput('github-token'),
    workflowRunId: parseNumberOrUseDefault(
      core.getInput('workflow-run-id'),
      github.context.runId,
      0,
      Number.MAX_VALUE
    ),
    issueId: parseNumberOrUseDefault(
      core.getInput('issue-id'),
      github.context.issue.number,
      0,
      Number.MAX_VALUE
    ),
    owner: parseStringOrUseDefault(
      core.getInput('owner'),
      github.context.repo.owner
    ),
    repo: parseStringOrUseDefault(
      core.getInput('repo'),
      github.context.repo.repo
    ),
    commentMode: parseCommentMode(core.getInput('comment-mode')),
    hiddenKey: core.getInput('hidden-key'),
    separator: core.getInput('separator'),
    handlebarsTemplate: parseStringOrUseDefault(
      core.getInput('handlebars-template'),
      HandlebarsTemplatePath
    )
  }
}

/**
 * Parses a string input to a number or returns a default value if parsing fails.
 * Ensures the parsed number is within a specified range.
 * @param inputToParse - The input string to parse.
 * @param defaultInput - The default value to use if parsing fails.
 * @param floor - The minimum acceptable value (inclusive).
 * @param ceiling - The maximum acceptable value (inclusive).
 * @returns The parsed number or the default value.
 * @throws RangeError if the parsed number is not within the specified range.
 */
export function parseNumberOrUseDefault(
  inputToParse: string,
  defaultInput: number,
  floor: number = Number.NEGATIVE_INFINITY,
  ceiling: number = Number.POSITIVE_INFINITY
): number {
  const parsedInput: number = Number(inputToParse)
  const parsedNumber =
    isNaN(parsedInput) || parsedInput === 0 ? defaultInput : parsedInput
  if (parsedNumber <= floor || parsedNumber >= ceiling) {
    throw RangeError(
      `Parsed number is not between ${floor.toString()} and ${ceiling.toString()}.`
    )
  }
  return parsedNumber
}

/**
 * Parses a string input or returns a default value if the input is empty.
 * @param inputToParse - The input string to parse.
 * @param defaultInput - The default value to use if the input is empty.
 * @returns The input string or the default value.
 */
export function parseStringOrUseDefault(
  inputToParse: string,
  defaultInput: string
): string {
  return inputToParse === '' ? defaultInput : inputToParse
}
