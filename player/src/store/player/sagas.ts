import { all, put, takeEvery } from 'redux-saga/effects';
import { setCurrentTime, setDuration, setTime } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { SetTimePayload } from './types';

function* setTimeSaga(action: PayloadAction<SetTimePayload>) {
    const { payload: { currentTime, duration } } = action;    

    yield all([
        put(setCurrentTime(currentTime)),
        put(setDuration(duration)),
    ]);
}

export function* playerRootSaga() {
    yield all([
        takeEvery(setTime.type, setTimeSaga),
    ]);
}