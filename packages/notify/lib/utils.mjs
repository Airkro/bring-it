import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

import { http } from '@bring-it/utils/index.mjs';
// eslint-disable-next-line import/no-unresolved
import { CommitParser } from 'conventional-commits-parser';
import { clean } from 'fast-clean';
import gitlog from 'gitlog';
import groupBy from 'lodash/groupBy.js';
import sortBy from 'lodash/sortBy.js';
import { toMarkdown } from 'mdast-util-to-markdown';
import semverPrerelease from 'semver/functions/prerelease.js';

import {
  ARTIFACT_URL,
  BRANCH_NAME,
  BRANCH_URL,
  CCI_JOB_NAME,
  CI_BUILD_NUMBER,
  COMMIT_COMPARE_TEXT,
  COMMIT_COMPARE_URL,
  COMMIT_URL_PREFIX,
  CUSTOM_ARTIFACT_URL,
  DEPOT_NAME,
  DOCKER_REG_HOST,
  GIT_COMMIT,
  GIT_HTTP_URL,
  GIT_PREVIOUS_COMMIT,
  JOB_ID,
  LOG_LINK,
  npm_package_version,
} from './env.mjs';

const digest = (imageName) => {
  try {
    const io = execSync(`docker images --format "{{.Digest}}" ${imageName}`, {
      encoding: 'utf8',
    });

    return [
      ...new Set(
        io
          .trim()
          .split('\n')
          .map((line) => line.trim()),
      ),
    ][0];
  } catch (error) {
    console.error(error);

    return '';
  }
};

function getVersion({ isLatest, version, rc }) {
  let name = npm_package_version;

  if (version !== true) {
    try {
      name = createRequire(import.meta.url)(`${version}/package.json`).version;
    } catch {}
  }

  const ver = rc && CI_BUILD_NUMBER ? `${name}-rc${CI_BUILD_NUMBER}` : name;

  return isLatest ? ['latest', ver].join(' / ') : ver;
}

export function dingtalk({ markdown, token }) {
  console.log(markdown);

  return http({
    url: 'https://oapi.dingtalk.com/robot/send',
    query: { access_token: token },
    method: 'POST',
    json: {
      msgtype: 'markdown',
      markdown: {
        title: '版本发布通知',
        text: markdown
          .split('更新历史：')
          .map((text, i) =>
            i === 0
              ? text.replaceAll('\n\n', '\n\n<br/>\n\n')
              : text.replaceAll('\n\n##', '\n\n<br/>\n\n##'),
          )
          .join('更新历史：')
          .trim(),
      },
    },
  })
    .then((resp) => {
      console.log(resp);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

function isTest() {
  return BRANCH_NAME !== 'master' || semverPrerelease(npm_package_version);
}

const configs = {
  feat: {
    label: '功能变化',
    order: 0,
  },
  fix: {
    label: '功能修复',
    order: 1,
  },
  perf: {
    label: '性能优化',
    order: 2,
  },
  refactor: {
    label: '代码重构',
    order: 3,
  },
  revert: {
    label: '回滚',
    order: 4,
  },
  chore: {
    label: '其他杂项',
    order: 5,
  },
  style: {
    label: '代码风格',
    order: 6,
  },
  test: {
    label: '测试',
    order: 7,
  },
  build: {
    label: '编译配置',
    order: 8,
  },
  ci: {
    label: '自动化',
    order: 9,
  },
  docs: {
    label: '补充文档',
    order: 10,
  },
};

async function getlog(from, to) {
  console.log({ from, to });

  return gitlog({
    repo: process.cwd(),
    number: 100,
    branch: `${from}...${to}`,
    fields: ['hash', 'abbrevHash', 'subject'],
  }).then((list) => list.filter(({ status }) => status.length));
}

async function getLogs() {
  try {
    if (!GIT_PREVIOUS_COMMIT) {
      throw new Error('GIT_PREVIOUS_COMMIT is null');
    }

    return getlog(GIT_PREVIOUS_COMMIT, GIT_COMMIT);
  } catch (error) {
    console.error(error);

    try {
      return getlog('HEAD~5', 'HEAD');
    } catch (error_) {
      console.error(error_);

      try {
        return getlog('HEAD~1', 'HEAD');
      } catch (error__) {
        console.error(error__);

        return [];
      }
    }
  }
}

const headerPattern = /^(\w*)(?:\((\S*)\))?:\s?(.*)$/;

const parser = new CommitParser({
  headerPattern,
});

async function getCommits() {
  const io =
    !GIT_PREVIOUS_COMMIT || (GIT_COMMIT && GIT_COMMIT === GIT_PREVIOUS_COMMIT)
      ? []
      : sortBy(
          Object.entries(
            groupBy(
              (await getLogs()) // eslint-disable-next-line unicorn/no-await-expression-member
                .map(({ abbrevHash, hash, subject }) => ({
                  hash,
                  abbrevHash,
                  message: parser.parse(subject),
                  subject,
                  url: `${COMMIT_URL_PREFIX}/${hash}`,
                })),
              ({ message }) => message?.type || '未分类',
            ),
          ),
          ([type]) => configs[type]?.order || 99,
        ).flatMap(([type, list]) => [
          {
            type: 'heading',
            depth: 4,
            meta: {
              type,
            },
            children: [
              {
                type: 'text',
                value: configs[type]?.label || type,
              },
            ],
          },
          {
            type: 'list',
            spread: false,
            children: list.map(({ subject, url }) => ({
              type: 'listItem',
              children: [
                {
                  type: 'link',
                  url,
                  children: [
                    {
                      type: 'text',
                      value: subject,
                    },
                  ],
                },
              ],
            })),
          },
        ]);

  return io.length > 0
    ? [
        {
          type: 'heading',
          depth: 3,
          children: [
            {
              type: 'text',
              value: '更新历史：',
            },
          ],
        },
        ...io,
      ]
    : io;
}

export async function createContent({
  project = '未命名项目',
  type,
  manual = true,
  banner,
  isLatest = false,
  image,
  version = true,
  rc = false,
}) {
  const levels = await getCommits();

  const imageName = image === true ? `${DOCKER_REG_HOST}/${DEPOT_NAME}` : image;

  const sha = image ? digest(imageName) : undefined;

  return {
    levels: levels
      .filter((item) => item.type === 'heading' && item.meta?.type)
      .map(({ meta }) => meta.type),
    markdown: toMarkdown({
      type: 'root',
      children: clean([
        banner
          ? {
              type: 'paragraph',
              children: [
                {
                  type: 'image',
                  url: banner,
                },
              ],
            }
          : undefined,
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: '任务 ',
            },
            {
              type: 'text',
              value: CCI_JOB_NAME,
            },
            {
              type: 'text',
              value: ' - ',
            },
            {
              type: 'link',
              url: LOG_LINK,
              children: [
                {
                  type: 'text',
                  value: `#${CI_BUILD_NUMBER}`,
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: ' 发布了新的版本',
            },
          ],
        },
        {
          type: 'list',
          spread: false,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: `所属项目：${project}`,
                    },
                  ],
                },
              ],
            },
            type
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: `发布类型：${type}`,
                        },
                      ],
                    },
                  ],
                }
              : undefined,
            image
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'text',
                      value: `镜像名称：${imageName}`,
                    },
                  ],
                }
              : undefined,
            version
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: `版本编号：${getVersion({
                            isLatest,
                            version,
                            rc,
                          })}`,
                        },
                      ],
                    },
                  ],
                }
              : undefined,
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: manual ? '请择时部署到 ' : '已自动部署到 ',
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: isTest() ? '内部测试' : '外部正式',
                },
              ],
            },
            {
              type: 'text',
              value: ' 环境',
            },
          ],
        },
        ...(CUSTOM_ARTIFACT_URL
          ? [
              {
                type: 'heading',
                depth: 3,
                children: [
                  {
                    type: 'text',
                    value: '部署资源包：',
                  },
                ],
              },
              {
                type: 'code',
                lang: 'bash',
                value: [
                  `curl ${CUSTOM_ARTIFACT_URL}`,
                  `wget ${CUSTOM_ARTIFACT_URL}`,
                ].join('\n'),
              },
            ]
          : []),
        {
          type: 'list',
          spread: false,
          children: [
            DEPOT_NAME
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: '代码仓库：',
                        },
                        {
                          type: 'link',
                          url: GIT_HTTP_URL,
                          children: [
                            {
                              type: 'text',
                              value: DEPOT_NAME,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : undefined,
            BRANCH_NAME
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: '执行分支：',
                        },
                        {
                          type: 'link',
                          url: BRANCH_URL,
                          children: [
                            {
                              type: 'text',
                              value: BRANCH_NAME,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : undefined,
            GIT_COMMIT
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: '版本变更：',
                        },
                        {
                          type: 'link',
                          url: COMMIT_COMPARE_URL,
                          children: [
                            {
                              type: 'text',
                              value: COMMIT_COMPARE_TEXT,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : undefined,
            JOB_ID && !image
              ? {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: '构建产物：',
                        },
                        {
                          type: 'link',
                          url: ARTIFACT_URL,
                          children: [
                            {
                              type: 'text',
                              value: `CI - #${CI_BUILD_NUMBER}`,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : undefined,
          ],
        },
        ...(image
          ? [
              {
                type: 'blockquote',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', value: sha }],
                  },
                ],
              },
            ]
          : []),
        ...levels,
      ]),
    }),
  };
}
