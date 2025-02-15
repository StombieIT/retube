import { all, fork } from 'redux-saga/effects';
import { authRootSaga } from './auth/sagas';
import { flowCandidatesRootSaga } from './flow-candidates/sagas';
import { sharedRootSaga } from './shared/sagas';

export function* rootSaga() {
    yield all([
        fork(authRootSaga),
        fork(flowCandidatesRootSaga),
        fork(sharedRootSaga),
    ]);
}
