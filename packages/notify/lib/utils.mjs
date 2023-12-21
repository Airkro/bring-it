import { createRequire } from 'node:module';

import { sync } from 'conventional-commits-parser';
import { clean } from 'fast-clean';
import gitlog from 'gitlog';
import groupBy from 'lodash/groupBy.js';
import sortBy from 'lodash/sortBy.js';
import { toMarkdown } from 'mdast-util-to-markdown';
import semverPrerelease from 'semver/functions/prerelease.js';

import { http } from '@bring-it/utils/index.mjs';

const {
  BRANCH_NAME,
  CCI_JOB_NAME,
  CI_BUILD_NUMBER,
  DEPOT_NAME,
  GIT_COMMIT_SHORT,
  GIT_COMMIT,
  GIT_PREVIOUS_COMMIT,
  GIT_HTTP_URL,
  JOB_ID,
  npm_package_version = '未知',
  PROJECT_NAME,
  PROJECT_WEB_URL,
} = process.env;

function getVersion({ isLatest, version }) {
  let name = npm_package_version;

  if (version !== true) {
    try {
      name = createRequire(import.meta.url)(`${version}/package.json`).version;
    } catch {}
  }

  return isLatest ? ['latest', name].join(' / ') : name;
}

export function dingtalk({ markdown, title, token }) {
  console.log({ title });

  console.log(markdown);

  return http({
    url: 'https://oapi.dingtalk.com/robot/send',
    query: { access_token: token },
    method: 'POST',
    json: {
      msgtype: 'markdown',
      markdown: {
        title,
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
  });
}

function isTest() {
  return BRANCH_NAME !== 'master' || semverPrerelease(npm_package_version);
}

const configs = {
  feat: {
    label: '功能变化',
    level: 0,
  },
  fix: {
    label: '功能修复',
    level: 1,
  },
  perf: {
    label: '性能优化',
    level: 2,
  },
  refactor: {
    label: '重构',
    level: 3,
  },
  revert: {
    label: '回滚',
    level: 4,
  },
  chore: {
    label: '杂项',
    level: 5,
  },
  style: {
    label: '代码风格',
    level: 6,
  },
  test: {
    label: '测试',
    level: 7,
  },
  build: {
    label: '编译配置',
    level: 8,
  },
  ci: {
    label: '自动化',
    level: 9,
  },
  docs: {
    label: '补充文档',
    level: 10,
  },
};

function getlog(since, until) {
  return gitlog({
    repo: '.',
    since,
    until,
    fields: ['hash', 'abbrevHash', 'subject'],
  });
}

function getLogs() {
  try {
    return getlog(GIT_PREVIOUS_COMMIT, GIT_COMMIT);
  } catch {
    return getlog('HEAD~5', 'HEAD');
  }
}

function getCommits() {
  const io =
    GIT_COMMIT === GIT_PREVIOUS_COMMIT
      ? []
      : sortBy(
          Object.entries(
            groupBy(
              getLogs().map(({ abbrevHash, hash, subject }) => ({
                hash,
                abbrevHash,
                message: sync(subject),
                subject,
              })),
              ({ message }) => message.type,
            ),
          ),
          ([type]) => configs[type].level,
        ).flatMap(([type, list]) => [
          {
            type: 'heading',
            depth: 4,
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
            children: list.map(({ hash, subject }) => ({
              type: 'listItem',
              children: [
                {
                  type: 'link',
                  url: `${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/commit/${hash}`,
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

export function createContent({
  project = '未命名项目',
  type,
  manual = true,
  banner,
  isLatest = false,
  image,
  version = true,
}) {
  return toMarkdown({
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
            value: CCI_JOB_NAME || '自动化任务',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          PROJECT_NAME
            ? {
                type: 'link',
                url: PROJECT_WEB_URL,
                children: [
                  {
                    type: 'text',
                    value: PROJECT_NAME,
                  },
                ],
              }
            : {
                type: 'text',
                value: project,
              },
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
                    value: `镜像名称：${image}`,
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
                        value: `版本编号：${getVersion({ isLatest, version })}`,
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
                        url: `${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/tree/${BRANCH_NAME}`,
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
                        url: `${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/commit/${GIT_COMMIT}`,
                        children: [
                          {
                            type: 'text',
                            value:
                              GIT_COMMIT === GIT_PREVIOUS_COMMIT
                                ? GIT_COMMIT_SHORT
                                : [
                                    GIT_PREVIOUS_COMMIT.slice(0, 7),
                                    GIT_COMMIT_SHORT,
                                  ].join('...'),
                          },
                        ],
                      },
                    ],
                  },
                ],
              }
            : undefined,
          JOB_ID
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
                        url: `${PROJECT_WEB_URL}/ci/job/${JOB_ID}/build/${CI_BUILD_NUMBER}/artifacts`,
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
      ...getCommits(),
    ]),
  });
}
