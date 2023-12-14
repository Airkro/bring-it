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
  npm_package_version,
  PROJECT_NAME,
  PROJECT_WEB_URL,
} = process.env;

export function dingtalk({ markdown, title, token }) {
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

export function createContent({ description, type }) {
  return `
### ${CCI_JOB_NAME}

[${PROJECT_NAME}](${PROJECT_WEB_URL}) 发布了新的版本

- 所属项目：${description}
- 发布类型：${type}
- 版本编号：${npm_package_version}

请择时部署到 **线上** 环境

- 代码仓库：[${DEPOT_NAME}](${GIT_HTTP_URL})
- 执行分支：[${BRANCH_NAME}](${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/tree/${BRANCH_NAME})
- 版本变更：[${GIT_COMMIT_SHORT}](${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/commit/${GIT_COMMIT})
- 构建产物：[CI - #${CI_BUILD_NUMBER}](${PROJECT_WEB_URL}/ci/job/${JOB_ID}/build/${CI_BUILD_NUMBER}/artifacts)
`;
}
