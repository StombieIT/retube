import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { setMainFlowId, updateFlows } from '../video/slice';
import { DistributedFlow } from '../video/types';
import { videoManager } from '../../managers/video-manager/manager';
import dashjs from 'dashjs';
import { pause, play, reload, seek, togglePlay } from './actions';
import { selectFlowIds } from '../video/selectors';
import { PlayerStatus } from '../../types/player';
import { setStatus } from '../player/slice';
import { onEnded, onTimeupdate, doSeek } from './helpers';
import { selectPlayerStatus } from '../player/selectors';

function* createFlow(flow: DistributedFlow) {
    const { distributionUrls } = flow;
    const { dash } = distributionUrls;
    const video = document.createElement('video');
    video.playsInline = true;
    video.dataset.id = flow.id;
    const player = dashjs.MediaPlayer().create();
    player.initialize(video, dash, false);
    yield call([videoManager, videoManager.addVideo], flow.id, player);
}

function* handleUpdateFlows({ payload }: PayloadAction<DistributedFlow | DistributedFlow[]>) {
    const flows = Array.isArray(payload) ? payload : [payload];

    const newFlows = flows.filter(({ id }) => !videoManager.isVideoExistsById(id));

    yield all(
        newFlows.map((flow) => call(createFlow, flow))
    );
}

function* getFlows() {
    const flowIds: string[] = yield select(selectFlowIds);

    return flowIds.reduce((flows, flowId) => {
        const flow = videoManager.getVideoById(flowId);
        if (flow) {
            flows.push(flow);
        }
        return flows;
    }, [] as dashjs.MediaPlayerClass[]);
}

function* getVideos() {
    const flows: dashjs.MediaPlayerClass[] = yield call(getFlows);
    const videos = flows.map(flow => flow.getVideoElement())
    return videos;
}

function* playSaga() {
    const videos: HTMLVideoElement[] = yield call(getVideos);

    yield all(
        videos.map((video) => video.play())
    );
    yield put(setStatus(PlayerStatus.PLAYING));
}

function* pauseSaga() {
    const videos: HTMLVideoElement[] = yield call(getVideos);

    yield all(
        videos.map((video) => video.pause())
    );
    yield put(setStatus(PlayerStatus.PAUSED));
}

function* reloadSaga() {
    const videos: HTMLVideoElement[] = yield call(getVideos);

    yield all(
        videos.map((video) => call(doSeek, video, 0)),
    );

    yield call(playSaga);
}

function* seekSaga(action: PayloadAction<number>) {
    const videos: HTMLVideoElement[] = yield call(getVideos);

    yield all(
        videos.map((video) => call(doSeek, video, action.payload)),
    );
}


function* togglePlaySaga() {
    const status: PlayerStatus = yield select(selectPlayerStatus);
    switch (status) {
        case PlayerStatus.PLAYING:
            yield put(pause());
            return;
        case PlayerStatus.PAUSED:
            yield put(play());
            return;
        case PlayerStatus.FINISHED:
            yield put(reload());
            return;
    }
}

function* handleUpdateMainFlow(prevFlowId: string | null, currentFlowId: string | null) {
    const videos: HTMLVideoElement[] = yield call(getVideos);
    videos.forEach((video) => {
        const videoId = video.dataset.id;
        if (prevFlowId === videoId) {
            video.removeEventListener('timeupdate', onTimeupdate);
            video.removeEventListener('ended', onEnded);
        }
        if (currentFlowId === videoId) {
            video.addEventListener('timeupdate', onTimeupdate);
            video.addEventListener('ended', onEnded);
            video.muted = false;
        } else {
            video.muted = true;
        }
    });
}

function* uploadMainFlowWatcher() {
    let prevFlowId: string | null = null;
    while (true) {
        const { payload: flowId }: PayloadAction<string | null> = yield take(setMainFlowId.type);
        yield call(handleUpdateMainFlow, prevFlowId, flowId);
        prevFlowId = flowId;
    }
}

export function* rootPlayerSagas() {
    yield all([
        fork(uploadMainFlowWatcher),
        takeLatest(updateFlows.type, handleUpdateFlows),
        takeLatest(play.type, playSaga),
        takeLatest(pause.type, pauseSaga),
        takeLatest(reload.type, reloadSaga),
        takeLatest(seek.type, seekSaga),
        takeLatest(togglePlay.type, togglePlaySaga),
    ]);
}
