import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { getVolumeRatio } from './helpers';

export const selectPlayerStatus = (state: RootState) => state.player.status;
export const selectPlayerTime = (state: RootState) => state.player.currentTime;
export const selectDuration = (state: RootState) => state.player.duration;
export const selectIsFullScreenOpened = (state: RootState) => state.player.isFullScreenOpened;
export const selectIsMuted = (state: RootState) => state.player.isMuted;
export const selectVolume = (state: RootState) => state.player.volume;
export const selectVolumeRatio = createSelector([selectVolume], getVolumeRatio);
