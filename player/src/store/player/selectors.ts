import { RootState } from '../types';

export const selectPlayerStatus = (state: RootState) => state.player.status;
