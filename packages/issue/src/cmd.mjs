export const command = 'issue';

export const describe = 'Generate a GitHub issue deep link from an issue form';

export function builder(cli) {
  cli
    .option('repo', {
      alias: 'r',
      describe: 'GitHub repository in "owner/name" format',
      type: 'string',
      demandOption: true,
    })
    .option('template', {
      alias: 't',
      describe: 'Issue form file name',
      type: 'string',
      default: 'bug_report.yml',
    })
    .option('template-dir', {
      describe: 'Directory that contains the issue templates',
      type: 'string',
    })
    .option('title', {
      describe: 'Issue title (defaults to the template title)',
      type: 'string',
    })
    .option('labels', {
      describe: 'Comma separated labels (defaults to the template labels)',
      type: 'string',
    })
    .option('field', {
      alias: 'f',
      describe: 'Field value as "id=value", repeatable',
      type: 'array',
    })
    .option('data', {
      alias: 'd',
      describe: 'Path to a JSON file mapping field ids to values',
      type: 'string',
    })
    .option('json', {
      describe: 'Output the result as JSON',
      type: 'boolean',
      default: false,
    })
    .option('auto-compress', {
      describe: 'Compress missing field values from the tier title',
      type: 'boolean',
      default: true,
    });
}

export function handler(io) {
  import('./lib/action.mjs')
    .then(({ action }) =>
      action({
        repo: io.repo,
        template: io.template,
        templateDir: io.templateDir,
        title: io.title,
        labels: io.labels,
        fields: io.field,
        data: io.data,
        json: io.json,
        autoCompress: io.autoCompress,
      }),
    )
    .catch((error) => {
      process.exitCode = 1;
      console.error(error.message || error);
    });
}
