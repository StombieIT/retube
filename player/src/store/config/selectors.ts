import { RootState } from '../types';

export const selectIsControlsHideable = (state: RootState) => state.config.isControlsHideable;
