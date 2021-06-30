import * as _ from 'lodash';
import { call, put, takeLatest, all } from 'redux-saga/effects';

import * as lockfile from '@yarnpkg/lockfile';
import { request } from './helpers';


function* loadStats() {
  try {
    const statsData = yield call(request, 'stats.json');
    statsData['chunks'] = _.orderBy(statsData['chunks'], ['entry', 'size'], ['desc', 'desc']);

    console.log(statsData);
    yield put({ type: 'LOAD_STATS_SUCCEEDED', data: statsData });
  } catch (error) {
    yield put({ type: 'LOAD_STATS_FAILED', error });
  }
}

function* loadLockfile() {
  try {
    const data = yield call(request, 'yarn2.lock');
    // console.log(lockfile.parse(data).object);

    const normalizedLockfile = _.reduce(lockfile.parse(data).object, (result, v, k) => {
      const normalizedName = k.substring(0, k.lastIndexOf('@'));
      if (!result[normalizedName]) {
        result[normalizedName] = [];
      }
      result[normalizedName].push({
        version: k.substring(k.lastIndexOf('@') + 1),
        dependencies: v.dependencies
      });
      return result;
    }, {});
    // console.log(normalizedLockfile);

    yield put({ type: 'LOAD_LOCKFILE_SUCCEEDED', data: normalizedLockfile });
  } catch (error) {
    yield put({ type: 'LOAD_LOCKFILE_FAILED', error });
  }
}


export default function* rootSaga() {
  yield all([
    takeLatest('LOAD_STATS', loadStats),
    takeLatest('LOAD_LOCKFILE', loadLockfile),
  ]);
}