import { RootState } from '../types';

export const selectToPlay = (state: RootState) =>
    state.slotControl.toPlay;

export const selectCanPlayMap = (state: RootState) =>
    state.slotControl.canPlayByFlowId;
