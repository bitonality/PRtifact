# PRtifact

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

PRtifact is a GitHub Action utility designed for reporting workflow artifacts as
comments on pull requests.

## Description

PRtifact fetches artifacts generated during workflow runs and posts them as
comments on the corresponding pull request. This action is highly customizable,
allowing you to specify the exact format and behavior of the comments. An
example PR comment is shown below:

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
<!-- prettier-ignore -->
| [![test-artifact_name-1](https://img.shields.io/badge/test--artifact__name--1-472d30?style=for-the-badge&logo=github)](https://github.com/bitonality/PRtifact/actions/runs/9766820165) | [![Download](https://img.shields.io/badge/Download-723d46?style=for-the-badge&logo=%5Bobject+Object%5D)](https://github.com/bitonality/PRtifact/actions/runs/9766820165/artifacts/1661093182) | [![Logs](https://img.shields.io/badge/Logs-723d46?style=for-the-badge&logo=%5Bobject+Object%5D)](https://github.com/bitonality/PRtifact/actions/runs/9766820165) |
| :---: | :---: | :---: |

<details><summary>Build Details</summary>

| Name         | Information                              |
| ------------ | ---------------------------------------- |
| PR Commit    | 784eea0db6f6c5ed31e109556ae1b69dd15e7b05 |
| Merge Commit | 411029d144c4cc3d8f5d4b181d9548accfe1e3ae |
| Size         | 1 MB                                     |
| Last Updated | Jul 2, 24, 7:24:40 PM UTC                |
| Expires At   | Jul 3, 24, 7:24:40 PM UTC                |

</details>

---

<!-- prettier-ignore -->
| [![test-artifact_name-2](https://img.shields.io/badge/test--artifact__name--2-472d30?style=for-the-badge&logo=github)](https://github.com/bitonality/PRtifact/actions/runs/9766820165) | [![Download](https://img.shields.io/badge/Download-723d46?style=for-the-badge&logo=%5Bobject+Object%5D)](https://github.com/bitonality/PRtifact/actions/runs/9766820165/artifacts/1661093259) | [![Logs](https://img.shields.io/badge/Logs-723d46?style=for-the-badge&logo=%5Bobject+Object%5D)](https://github.com/bitonality/PRtifact/actions/runs/9766820165) |
| :---: | :---: | :---: |

<details><summary>Build Details</summary>

| Name         | Information                              |
| ------------ | ---------------------------------------- |
| PR Commit    | 784eea0db6f6c5ed31e109556ae1b69dd15e7b05 |
| Merge Commit | 411029d144c4cc3d8f5d4b181d9548accfe1e3ae |
| Size         | 256.23 KB                                |
| Last Updated | Jul 2, 24, 7:24:40 PM UTC                |
| Expires At   | Jul 3, 24, 7:24:41 PM UTC                |

</details>

<!-- markdownlint-restore -->

## Inputs

### `github-token`

- **Description**: GitHub token.
- **Default**: `${{ github.token }}`

### `workflow-run-id`

- **Description**: Workflow run number to get artifacts from. Defaults to the
  workflow job run that is calling this action.
- **Default**: `${{ github.run_id }}`

### `issue-id`

- **Description**: Issue ID to upload the artifact report to. Defaults to the
  event that called the workflow that is calling this action.
- **Default**: `${{ github.event.number }}`

### `owner`

- **Description**: Owner to use for artifact querying and report uploading.
- **Default**: `${{ github.event.repository.owner.name }}`

### `repo`

- **Description**: Repository to use for artifact querying and report uploading.
- **Default**: `${{ github.event.repository.name }}`

### `comment-mode`

- **Description**: Comment mode. Must be one of `Create`, `CreateOrAppend`,
  `CreateOrUpdate`, `Append`, `Update`.
- **Default**: `Create`

### `hidden-key`

- **Description**: Hidden string within the comment body that is used to find
  which comment to update. Used by all comment modes except `Create`.
- **Default**: `<!-- PRtifact -->`

### `separator`

- **Description**: Separator to add between reports when using the
  `CreateOrAppend` or `Append` mode.
- **Default**: `\n`

### `handlebars-template`

- **Description**: Custom Handlebars template. Can either be a path to a
  Handlebars file or a literal string.
- **Required**: No

## Usage

To use this action, include it as a step in your workflow file. Below is an
example:

```yaml
name: Example Workflow

on:
  pull_request:
    branches: ['main']

permissions:
  contents: read
  pull-requests: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run some task that uploads artifacts
        run: echo "Running some tasks..."

      - name: Use PRtifact to post artifacts as PR comment
        uses: bitonality/PRtifact
        with:
          comment-mode: 'CreateOrUpdate'
```

## Comment Modes

- `Create`: Creates a new comment.
- `CreateOrAppend`: Creates a new comment or appends to an existing comment.
- `CreateOrUpdate`: Creates a new comment or updates an existing comment.
- `Append`: Appends to an existing comment. Does not create a comment if an
  existing comment doesn't exist.
- `Update`: Updates an existing comment. Does not create a comment if an
  existing comment doesn't exist.

## Custom Template

You can provide a custom Handlebars template for formatting the report. This can
either be a file path or a literal string. The default template can be found
here: [report.hbs](./src/templates/report.hbs)

### Providing your own template

#### Artifact Properties

You can iterate over the list of artifacts using a handlebars each loop

```handlebars
{{#each artifacts}}
  <!-- Access properties of artifacts -->
{{/each}}
```

Each artifact object includes the following properties:

- `id`: The unique identifier of the artifact.
- `node_id`: The node ID of the artifact.
- `name`: The name of the artifact.
- `size_in_bytes`: The size of the artifact in bytes.
- `url`: The URL to access the artifact.
- `archive_download_url`: The URL to download the artifact archive.
- `expired`: A boolean indicating whether the artifact has expired.
- `created_at`: The date and time when the artifact was created (nullable).
- `expires_at`: The date and time when the artifact will expire (nullable).
- `updated_at`: The date and time when the artifact was last updated (nullable).
- `workflow_run`: An optional object containing workflow run details:
  - `id`: The unique identifier of the workflow run (optional).
  - `repository_id`: The ID of the repository where the workflow run occurred
    (optional).
  - `head_repository_id`: The ID of the head repository (optional).
  - `head_branch`: The name of the branch the workflow run is associated with
    (optional).
  - `head_sha`: The SHA of the head commit the workflow run is associated with
    (optional).

#### Misc. Properties

The `../workflowRunUrl` variable is a pre-constructed URL in the form of
`../context.serverUrl`/`../context.repo.owner`/`../context.repo.name`/actions/runs/`../context.runId`.
Example: `https://github.com/bitonality/PRtifact/actions/runs/123`.

#### Context Properties

The `Context` object provides a rich set of information about the workflow run,
which can be used to dynamically populate a Handlebars template. Below is a
guide on how to utilize the `Context` properties within your template.

The `../context` object has the following properties:

- `payload`: The webhook payload object that triggered the workflow. You can
  access properties of the payload like this:
  `{{../context.payload.pull_request.head.sha}}`.
- `eventName`: The name of the event that triggered the workflow.
- `sha`: The commit SHA that triggered the workflow.
- `ref`: The git reference for the workflow.
- `workflow`: The name of the workflow.
- `action`: The name of the action.
- `actor`: The username of the person or app that triggered the workflow.
- `job`: The job name.
- `runNumber`: The number of times this workflow has been run for this event.
- `runId`: The unique identifier of the workflow run.
- `apiUrl`: The URL to the GitHub REST API.
- `serverUrl`: The GitHub server URL.
- `graphqlUrl`: The GitHub GraphQL API URL.
- `issue`: An object containing the repository `.owner`, `.name`, and issue
  `.number`.
- `repo`: A getter that returns the repository `.owner` and `.name`.

#### Helper Functions

- `pretty-date`: Pretty prints a date in UTC format. Example:
  `{{pretty-date updated_at}}` outputs "Jul 2, 24, 7:24:40 PM UTC"
- `pretty-size`: Pretty prints a number in byte size format. Example:
  `{{pretty-size size_in_bytes}}` outputs "256.23 KB"
- `badge`: Generates a shields.io badge URL in Markdown format. Example
  `{{badge "Download" "723d46"}}` outputs
  [!https://img.shields.io/badge/Download-723d46?style&#x3D;for-the-badge&amp;logo&#x3D;%5Bobject+Object%5D].
  Arguments are
  `{{badge <text on badge> <hex or color string> <optional simpleicons.org icon>}}`

## Troubleshooting

### Common Issues

- Ensure that the GitHub token has sufficient permissions. You need
  `contents: read` to query the artifacts and `pull-requests: write` to write to
  the PR comments.
- If you are using a custom `handlebars-template` ensure that the path is
  correct and accessible.
- Check the workflow logs for any error messages or stack traces.

### Debugging

To debug issues, you can enable step-by-step logging in your workflow file:

```yaml
jobs:
  build:
    steps:
      - name: Enable Debug Logging
        run: echo "::set-env name=ACTIONS_STEP_DEBUG::true"
```

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request
with your changes. Ensure that your code adheres to the existing coding
standards and includes appropriate tests and documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
