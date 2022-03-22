import { SET_ERROR, RESET } from '../actions/notification';

const initialState = {
    error: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ERROR:
            return {
                ...state,
                error: action.error
            };
        case RESET:
            return initialState;
        default:
            return state;
    }
}