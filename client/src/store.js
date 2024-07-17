import { configureStore } from '@reduxjs/toolkit';
import cardReducer from './actions';


export default configureStore({
    reducer: {
        card: cardReducer,
    },
});