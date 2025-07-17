const {
  CNB,
  CNB_BUILD_ID,
  CNB_BRANCH,
  CNB_COMMIT,
  CNB_COMMIT_SHORT,
  CNB_BEFORE_SHA,
  CNB_REPO_URL_HTTPS,
  CNB_REPO_SLUG_LOWERCASE,
  CNB_DOCKER_REGISTRY,
  CNB_PIPELINE_NAME,
  CNB_REPO_NAME_LOWERCASE,
  CNB_BUILD_WEB_URL,
} = process.env;

export const {
  npm_package_version = '未知',
  CUSTOM_ARTIFACT_URL,
  BRANCH_NAME = CNB ? CNB_BRANCH : undefined,
  CCI_JOB_NAME = CNB ? CNB_PIPELINE_NAME : undefined,
  CI_BUILD_NUMBER = CNB ? CNB_BUILD_ID : undefined,
  DEPOT_NAME = CNB ? CNB_REPO_NAME_LOWERCASE : undefined,
  GIT_COMMIT_SHORT = CNB ? CNB_COMMIT_SHORT : undefined,
  GIT_COMMIT = CNB ? CNB_COMMIT : undefined,
  GIT_PREVIOUS_COMMIT = CNB ? CNB_BEFORE_SHA : undefined,
  GIT_HTTP_URL = CNB ? CNB_REPO_URL_HTTPS : undefined,
  JOB_ID = CNB ? CNB_BUILD_ID : undefined,
  PROJECT_WEB_URL = CNB
    ? `https://cnb.cool/${CNB_REPO_SLUG_LOWERCASE}`
    : undefined,
  DOCKER_REG_HOST = CNB ? CNB_DOCKER_REGISTRY : undefined,
} = process.env;

export const LOG_LINK = CNB
  ? CNB_BUILD_WEB_URL
  : `${PROJECT_WEB_URL}/ci/job/${JOB_ID}/build/${CI_BUILD_NUMBER}/pipeline`;

const DEPOT_URL = CNB ? PROJECT_WEB_URL : `${PROJECT_WEB_URL}/d/${DEPOT_NAME}`;

export const BRANCH_URL = CNB
  ? `${PROJECT_WEB_URL}/-/tree/${BRANCH_NAME}`
  : `${PROJECT_WEB_URL}/d/${DEPOT_NAME}/git/tree/${BRANCH_NAME}`;

export const COMMIT_URL_PREFIX = CNB
  ? `${PROJECT_WEB_URL}/-/commit`
  : `${DEPOT_URL}/git/commit`;

export function short(hash = '') {
  return hash.slice(0, 7);
}

const COMMIT_COMPARE = `${short(GIT_PREVIOUS_COMMIT)}...${GIT_COMMIT_SHORT}`;

export const COMMIT_COMPARE_TEXT =
  !GIT_PREVIOUS_COMMIT || GIT_COMMIT === GIT_PREVIOUS_COMMIT
    ? GIT_COMMIT_SHORT
    : COMMIT_COMPARE;

export const COMMIT_COMPARE_PREFIX = CNB
  ? `${PROJECT_WEB_URL}/-/compare`
  : `${DEPOT_URL}/git/compare`;

export const COMMIT_COMPARE_URL =
  !GIT_PREVIOUS_COMMIT || GIT_COMMIT === GIT_PREVIOUS_COMMIT
    ? `${COMMIT_URL_PREFIX}/${GIT_COMMIT}`
    : `${COMMIT_COMPARE_PREFIX}/${COMMIT_COMPARE}`;

export const ARTIFACT_URL = CNB
  ? `${PROJECT_WEB_URL}/-/packages`
  : `${PROJECT_WEB_URL}/ci/job/${JOB_ID}/build/${CI_BUILD_NUMBER}/artifacts`;
