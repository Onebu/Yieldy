import { REFRESH_TOKEN, SIGNUP, LOGOUT, RESEND,AUTH_SUCCESS,DELETE_TOKEN } from '../actions/auth';

const initialState = {
    token: null,
    userInfo: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SIGNUP:
            return initialState
        case AUTH_SUCCESS:
            return {
                ...state,
                token: action.token,
                userInfo: action.userInfo
            };
        case LOGOUT:
            return initialState;
        case RESEND:
            return initialState;
        case REFRESH_TOKEN:
            return {
                ...state,
                token: action.token
            }
        case DELETE_TOKEN:
            return initialState;
        default:
            return state;
    }
};