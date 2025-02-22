import { createAction } from '@reduxjs/toolkit';

export const play = createAction('shared/play');
export const pause = createAction('shared/pause');

export const played = createAction<string>('shared/played');
export const paused = createAction<string>('shared/paused');
