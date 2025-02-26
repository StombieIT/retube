import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './root-saga';
import { videoReducer } from './video/slice';
import { errorReducer } from './error/slice';
import { slotControlReducer } from './slot-control/slice';
import { playerReducer } from './player/slice';
import { configReducer } from './config/slice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        video: videoReducer,
        error: errorReducer,
        slotControl: slotControlReducer,
        player: playerReducer,
        config: configReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
            serializableCheck: false,
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

// @ts-ignore
window.__store = store;
