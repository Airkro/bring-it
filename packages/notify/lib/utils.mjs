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
  GIT_HTTP_URL,
  JOB_ID,
  npm_package_version = '未知',
  PROJECT_NAME,
  PROJECT_WEB_URL,
} = process.env;

export function dingtalk({ markdown, title, token }) {
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
          .trim()
          // eslint-disable-next-line unicorn/prefer-string-replace-all
          .replace(/\n\n/g, '\n\n<br/>\n\n'),
      },
    },
  });
}

function isTest() {
  return BRANCH_NAME !== 'master' || semverPrerelease(npm_package_version);
}

export function createContent({
  project = '未命名项目',
  type,
  manual = true,
  banner,
  isLatest = false,
}) {
  return toMarkdown({
    type: 'root',
    children: [
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
        depth: 3,
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
                    type: 'text',
                    value: `发布类型：${type}`,
                  },
                ],
              }
            : undefined,
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: `版本编号：${
                      isLatest
                        ? ['latest', npm_package_version].join(' / ')
                        : npm_package_version
                    }`,
                  },
                ],
              },
            ],
          },
        ].filter(Boolean),
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
                            value: GIT_COMMIT_SHORT,
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
        ].filter(Boolean),
      },
    ].filter(Boolean),
  });
}
