import { createSlice } from '@reduxjs/toolkit';

const cardSlice = createSlice({
    name: 'card',
    initialState: { cardPositions: {} },
    reducers: {
        setCardPosition: (state, action) => {
            state.cardPositions[action.payload.cardId] = action.payload.position;
        },
    },
});

export const { setCardPosition } = cardSlice.actions;
export default cardSlice.reducer;