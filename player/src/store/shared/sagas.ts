import { all, call, fork, put, race, select, take, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { Gateway } from '@stombie/retube-core';
import { api } from '../../api';
import { setDescription, setId, setMainFlowId, setTitle, setUploadedAt, updateFlows } from '../video/slice';
import { DistributedFlow } from '../video/types';
import { setErrorType } from '../error/slice';
import { ErrorType } from '../../types/error-type';
import { pause, play } from './actions';
import { selectFlowIds } from '../video/selectors';
import { selectCanPlayMap } from '../slot-control/selectors';
import { AnyAction } from 'redux-saga';
import { setCanPlay, setToPlay } from '../slot-control/slice';
import { setStatus } from '../player/slice';
import { PlayerStatus } from '../../types/player';

function* waitUntilCanPlay(flowIds: string[]) {
    const tasks = flowIds.map((flowIdToWait) => take((action: AnyAction) => {
        if (action.type === setCanPlay.type) {
            const { payload } = action as ReturnType<typeof setCanPlay>;
            const { flowId, canPlay } = payload;
            return flowId === flowIdToWait && canPlay;
        }
        return false;
    }));

    yield all(tasks);
}

function* playSaga() {
    const flowIds: string[] = yield select(selectFlowIds);
    const canPlayMap: Record<string, boolean> = yield select(selectCanPlayMap);
    const cannotPlayFlowIds = flowIds.filter((flowId) =>
        !canPlayMap[flowId]
    );
    if (cannotPlayFlowIds.length) {
        yield waitUntilCanPlay(cannotPlayFlowIds);
    }
    yield put(setToPlay(true));
    yield put(setStatus(PlayerStatus.PLAYING));
}

function* pauseSaga() {
    yield put(setToPlay(false));
    yield put(setStatus(PlayerStatus.PAUSED));
}

function* playerSaga() {
    yield all([
        takeLatest(play.type, playSaga),
        takeLatest(pause.type, pauseSaga),
    ]);
}

function* fillContent() {
    try {
        const videoId = window.location.pathname.substring(1);

        const { data: { payload } }: AxiosResponse<Gateway.Response.State> =
            yield call(api.get, `/state/${videoId}`);
        const { id, title, description, flows, status, uploadedAt } = payload;

        if (status !== 'DISTRIBUTED') {
            yield put(setErrorType(ErrorType.VIDEO_NOT_DISTRIBUTED));
            return;
        }

        if (!flows.length) {
            yield put(setErrorType(ErrorType.NO_FLOWS));
            return;
        }

        const mainFlowId = flows[0].id;
        yield all([
            put(setId(id)),
            put(setMainFlowId(mainFlowId)),
            put(setTitle(title)),
            put(setDescription(description)),
            put(updateFlows(flows as DistributedFlow[])),
            put(setUploadedAt(uploadedAt || null)),
        ]);
    } catch (error) {
        // @ts-ignore
        // TODO: добавить error
    }
}

export function* sharedRootSaga() {
    yield all([
        fork(fillContent),
        fork(playerSaga),
    ]);
}