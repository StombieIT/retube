import { RootState } from '../types';

export const selectPlayerStatus = (state: RootState) => state.player.status;
export const selectPlayerTime = (state: RootState) => state.player.currentTime;
export const selectDuration = (state: RootState) => state.player.duration;
