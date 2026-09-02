import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';

import { logger } from './logger.mjs';

/**
 * @typedef {Object} FieldTier
 * @property {string} id
 * @property {string} [type]
 * @property {Object} [attributes]
 * @property {string} [attributes.id]
 * @property {string} [attributes.label]
 */

/**
 * @typedef {Object} IssueTemplate
 * @property {string} [title]
 * @property {string|string[]} [labels]
 * @property {FieldTier[]} [body]
 */

/**
 * Validate and normalize a `owner/name` repository reference.
 *
 * @param {string} repo
 * @returns {string}
 */
export function resolveRepo(repo) {
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error(`Invalid repository "${repo}", expected "owner/name".`);
  }

  return repo;
}

/**
 * Resolve the stable field id of an issue-form tier.
 *
 * @param {FieldTier} raw
 * @returns {string|undefined}
 */
export function resolveTierId(raw) {
  return raw.id || raw.attributes?.id || raw.attributes?.label;
}

/**
 * Resolve the human readable title of an issue-form tier.
 *
 * @param {FieldTier} raw
 * @returns {string|undefined}
 */
export function resolveTierTitle(raw) {
  return raw.attributes?.label || raw.attributes?.id || raw.id;
}

/**
 * Extract the prefillable tiers from a parsed issue form.
 *
 * @param {IssueTemplate} template
 * @returns {{ id: string, title: string }[]}
 */
export function resolveTiers(template) {
  return (template.body || [])
    .filter((tier) => tier.type !== 'markdown')
    .map((tier) => ({
      id: resolveTierId(tier),
      title: resolveTierTitle(tier),
    }))
    .filter((tier) => tier.id);
}

/**
 * Strip the leading `field.` prefix from a field id.
 *
 * @param {string} id
 * @returns {string}
 */
export function parseFieldId(id) {
  return id.replace(/^field\./, '');
}

/**
 * Resolve a field value, reading from a file when prefixed with `@`.
 *
 * @param {string} value
 * @returns {Promise<string>}
 */
export function parseFieldValue(value) {
  if (value?.startsWith('@')) {
    const file = value.slice(1);

    if (!existsSync(file)) {
      throw new Error(`Field file not found: ${file}`);
    }

    return readFile(file, 'utf8').then((text) => text.trim());
  }

  return Promise.resolve(value);
}

/**
 * Flatten arbitrary values into a single comma separated string.
 *
 * @param {...any} values
 * @returns {string}
 */
export function compressTier(...values) {
  const result = [];

  for (const value of values) {
    if (value == null) {
      // skip nullish values
    } else if (Array.isArray(value)) {
      result.push(...value.flatMap((item) => compressTier(item)));
    } else if (typeof value === 'object') {
      for (const item of Object.values(value)) {
        result.push(...compressTier(item));
      }
    } else {
      result.push(String(value));
    }
  }

  return result.join(', ');
}

/**
 * URL-encode a single field value, keeping spaces as `+` (GitHub style).
 *
 * @param {string} value
 * @returns {string}
 */
export function encodeFieldValue(value) {
  return encodeURIComponent(value).replaceAll('%20', '+');
}

/**
 * Serialize a field map into GitHub's `field.<id>=<value>` query pairs.
 *
 * @param {Record<string, string>} fields
 * @returns {string}
 */
export function encodeFields(fields) {
  return Object.entries(fields)
    .map(([id, value]) => `field.${id}=${encodeFieldValue(value)}`)
    .join('&');
}

/**
 * Read the frontmatter (or top level keys) of an issue template.
 *
 * @param {string} templatePath
 * @returns {Promise<{ title?: string, labels?: string }>}
 */
export function loadFrontmatter(templatePath) {
  return readFile(templatePath, 'utf8').then((raw) => {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const meta = match ? match[1] : raw;
    const doc = parse(meta) || {};

    const labels = Array.isArray(doc.labels)
      ? doc.labels.join(',')
      : (doc.labels ?? '');

    return { title: doc.name, labels };
  });
}

/**
 * Read and parse a GitHub issue form (`.yml`).
 *
 * @param {string} templatePath
 * @returns {Promise<IssueTemplate>}
 */
export function getGithubIssueTemplate(templatePath) {
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  return readFile(templatePath, 'utf8').then((raw) => {
    const doc = parse(raw) || {};

    return {
      title: doc.title,
      labels: doc.labels,
      body: Array.isArray(doc.body) ? doc.body : [],
    };
  });
}

/**
 * Build the field value map from `--field` flags and an optional `--data`
 * JSON file.
 *
 * @param {{ fields?: string[], data?: string }} options
 * @returns {Promise<Record<string, string>>}
 */
export async function buildFieldValues({ fields = [], data } = {}) {
  const map = {};

  for (const item of fields) {
    const eq = item.indexOf('=');

    if (eq === -1) {
      throw new Error(`Invalid --field "${item}", expected id=value`);
    }

    const id = parseFieldId(item.slice(0, eq));
    const raw = item.slice(eq + 1);

    map[id] = await parseFieldValue(raw);
  }

  if (data) {
    if (!existsSync(data)) {
      throw new Error(`Data file not found: ${data}`);
    }

    const json = JSON.parse(await readFile(data, 'utf8'));

    for (const [id, value] of Object.entries(json)) {
      map[parseFieldId(id)] = value == null ? '' : String(value);
    }
  }

  return map;
}

/**
 * Generate a GitHub issue deep link that prefills an issue form.
 *
 * @param {{
 *   repo: string,
 *   template?: string,
 *   templateDir?: string,
 *   title?: string,
 *   labels?: string,
 *   fields?: string[],
 *   data?: string,
 *   autoCompress?: boolean,
 * }} options
 * @returns {Promise<string>}
 */
export async function generateIssueLink({
  repo,
  template = 'bug_report.yml',
  templateDir,
  title,
  labels,
  fields = [],
  data,
  autoCompress = true,
} = {}) {
  const owner = resolveRepo(repo);

  const templatePath = templateDir
    ? join(resolve(process.cwd(), templateDir), template)
    : join(process.cwd(), '.github', 'ISSUE_TEMPLATE', template);

  const meta = await loadFrontmatter(templatePath);
  const resolvedTitle = title ?? meta.title;
  const resolvedLabels = labels ?? meta.labels;

  const templateDoc = await getGithubIssueTemplate(templatePath);
  const tiers = resolveTiers(templateDoc);
  const tierValues = await buildFieldValues({ fields, data });

  for (const tier of tiers) {
    const value = tierValues[tier.id] ?? tierValues[tier.title];

    if (value == null) {
      if (autoCompress) {
        tierValues[tier.id] = compressTier(tier.title, tier.id);
      } else {
        logger.warn(`Missing value for tier: ${tier.title}`);
      }
    }
  }

  const url = new URL(`https://github.com/${owner}/issues/new`);

  url.searchParams.set('template', template);

  if (resolvedTitle) {
    url.searchParams.set('title', resolvedTitle);
  }

  if (resolvedLabels) {
    url.searchParams.set('labels', resolvedLabels);
  }

  const encoded = encodeFields(tierValues);

  if (encoded) {
    url.search += `&${encoded}`;
  }

  return url.toString();
}

/**
 * Command entry point invoked by the `bring-it issue` handler.
 *
 * @param {{
 *   repo: string,
 *   template?: string,
 *   templateDir?: string,
 *   title?: string,
 *   labels?: string,
 *   fields?: string[],
 *   data?: string,
 *   json?: boolean,
 *   autoCompress?: boolean,
 * }} io
 * @returns {Promise<string>}
 */
export async function action({
  repo,
  template,
  templateDir,
  title,
  labels,
  fields,
  data,
  json,
  autoCompress,
} = {}) {
  const url = await generateIssueLink({
    repo,
    template,
    templateDir,
    title,
    labels,
    fields,
    data,
    autoCompress,
  });

  if (json) {
    process.stdout.write(
      `${JSON.stringify({ url, repo, template }, null, 2)}\n`,
    );
  } else {
    process.stdout.write(`${url}\n`);
  }

  return url;
}

process.on('SIGINT', () => {
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});
