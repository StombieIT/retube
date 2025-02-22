import { all, fork } from 'redux-saga/effects';
import { sharedRootSaga } from './shared/sagas';
import { playerRootSaga } from './player/sagas';

export function* rootSaga() {
    yield all([
        fork(sharedRootSaga),
        fork(playerRootSaga),
    ]);
}
