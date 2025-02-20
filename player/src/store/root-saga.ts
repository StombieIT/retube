import { all, fork } from 'redux-saga/effects';
import { sharedRootSaga } from '../shared/sagas';

export function* rootSaga() {
    yield all([
        fork(sharedRootSaga),
    ]);
}
