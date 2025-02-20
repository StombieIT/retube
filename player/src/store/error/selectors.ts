import { ErrorType } from '../../types/error-type';
import { RootState } from '../types';

export const ERROR_REASON_BY_TYPE = new Map<ErrorType, string>([
    [ErrorType.DEFAULT, 'Что-то пошло не так'],
    [ErrorType.VIDEO_NOT_DISTRIBUTED, 'Видео не раздается'],
    [ErrorType.VIDEO_NOT_FOUND, 'Видео не найдено'],
]);

export const selectErrorReason = (state: RootState) =>
    ERROR_REASON_BY_TYPE.get(state.error.type || ErrorType.DEFAULT);
