import pAll from 'p-all';
import pRetry, { AbortError } from 'p-retry';
import pSeries from 'p-series';
import pTimeout from 'p-timeout';

function withTimeout(promise) {
  return pTimeout(promise, {
    message: 'timeout...',
    milliseconds: 10000,
  });
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

function withRetry(action) {
  return pRetry(action, {
    retries: 5,
    async onFailedAttempt(error) {
      if (error.message === 'Permission denied') {
        throw new AbortError(error.message);
      } else {
        await delay();
      }
    },
  });
}

function withConcurrent(actions) {
  return pAll(actions, { concurrency: 5 });
}

function timeoutWithRetry(action) {
  return withRetry(() => withTimeout(action));
}

export function Queue({ groups, action, onOkay, onFail }) {
  function oneFile(file) {
    return timeoutWithRetry(action(file)).then(
      () => {
        onOkay(file);
      },
      (error) => {
        onFail(file);
        throw error;
      },
    );
  }

  function oneGroup(group) {
    return withConcurrent(group.map((file) => () => oneFile(file)));
  }

  return pSeries(groups.map((group) => () => oneGroup(group)));
}
