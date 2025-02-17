import { RootState } from '../types';

export const selectPlayerUrl = (state: RootState) => state.distribution.playerUrl;
