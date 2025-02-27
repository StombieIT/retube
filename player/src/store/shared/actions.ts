import { createAction } from '@reduxjs/toolkit';

export const play = createAction('shared/play');
export const pause = createAction('shared/pause');
export const reload = createAction('shared/reload');
export const seek = createAction<number>('shared/seek');
export const togglePlay = createAction('shared/togglePlay');
export const toggleSound = createAction('shared/toggleSound');
