import { RootState } from '../types';

export const selectVideoTitle = (state: RootState) => state.video.title;
export const selectVideoDescription = (state: RootState) => state.video.description;
