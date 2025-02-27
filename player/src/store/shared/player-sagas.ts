import { all, call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { setMainFlowId, updateFlows } from '../video/slice';
import { DistributedFlow } from '../video/types';
import { videoManager } from '../../managers/video-manager/manager';
import dashjs from 'dashjs';
import { pause, play, reload, seek, togglePlay, toggleSound } from './actions';
import { selectFlowIds, selectMainFlowId } from '../video/selectors';
import { PlayerStatus } from '../../types/player';
import { setIsMuted, setStatus, setVolume } from '../player/slice';
import { onEnded, onTimeupdate, doSeek } from './helpers';
import { selectIsMuted, selectPlayerStatus, selectVolume, selectVolumeRatio } from '../player/selectors';
import { getVolumeRatio } from '../player/helpers';

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

function* getMainVideo() {
    const mainFlowId: string = yield select(selectMainFlowId);
    const mainFlow: dashjs.MediaPlayerClass = yield call([videoManager, videoManager.getVideoById],
        mainFlowId
    );
    const video = mainFlow.getVideoElement();
    return video;
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

function* toggleSoundSaga() {
    const isMuted: boolean = yield select(selectIsMuted);
    yield put(setIsMuted(!isMuted));
    if (isMuted) {
        const volume: number = yield select(selectVolume);
        if (!volume) {
            yield put(setVolume(50));
        }
    }
}

function* updateIsMutedSaga(action: PayloadAction<boolean>) {
    const mainVideo: HTMLVideoElement = yield call(getMainVideo);
    mainVideo.muted = action.payload;
}

function* updateVolumeSaga(action: PayloadAction<number>) {
    const mainVideo: HTMLVideoElement = yield call(getMainVideo);
    mainVideo.volume = getVolumeRatio(action.payload);
}

function* handleUpdateMainFlow(prevFlowId: string | null, currentFlowId: string | null) {
    const videos: HTMLVideoElement[] = yield call(getVideos);
    const isMuted: boolean = yield select(selectIsMuted);
    const volume: number = yield select(selectVolumeRatio);
    videos.forEach((video) => {
        const videoId = video.dataset.id;
        if (prevFlowId === videoId) {
            video.removeEventListener('timeupdate', onTimeupdate);
            video.removeEventListener('ended', onEnded);
            video.muted = true;
        }
        if (currentFlowId === videoId) {
            video.addEventListener('timeupdate', onTimeupdate);
            video.addEventListener('ended', onEnded);
            video.muted = isMuted;
            video.volume = volume;
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
        takeLatest(toggleSound.type, toggleSoundSaga),
        takeEvery(setVolume.type, updateVolumeSaga),
        takeEvery(setIsMuted.type, updateIsMutedSaga),
    ]);
}
