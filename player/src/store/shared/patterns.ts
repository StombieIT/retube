import { AnyAction } from 'redux-saga';
import { canPlay, played } from './actions';

export const canPlayByFlowIdPattern = (flowId: string) => (action: AnyAction) => {
    console.log('test', action);
    return action.type === canPlay.type &&
    (action as ReturnType<typeof canPlay>).payload === flowId;
};

export const playByFlowIdPattern = (flowId: string) => (action: AnyAction) => {
    return action.type === played.type &&
    (action as ReturnType<typeof played>).payload === flowId;
}
