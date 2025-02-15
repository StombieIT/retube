import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddCandidateVideoPayload } from './types';

const initialState = [] as string[];

const flowCandidatesSlice = createSlice({
    name: 'flowCandidates',
    initialState,
    reducers: {
        addCandidate(state, action: PayloadAction<string>) {
            state.push(action.payload);
        },

        deleteCandidateById(state, action: PayloadAction<string>) {
            return state.filter(candidateId => candidateId !== action.payload);
        },
    },
});

export const addCandidateVideoAction = createAction<AddCandidateVideoPayload>('flowCandidates/addCandidateVideoAction');
export const deleteCandidateByIdAction = createAction<string>('flowCandidates/deleteCandidateByIdAction');
export const { addCandidate, deleteCandidateById: deleteFlowById } = flowCandidatesSlice.actions;
export const flowCandidatesReducer = flowCandidatesSlice.reducer;
