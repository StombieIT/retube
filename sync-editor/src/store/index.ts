import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas';
import { flowCandidatesReducer } from './flow-candidates/slice';
import { authReducer } from './auth/slice';
import { videoReducer } from './video/slice';
import { stageReducer } from './stage';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        flowCandidates: flowCandidatesReducer,
        auth: authReducer,
        video: videoReducer,
        stage: stageReducer,
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
