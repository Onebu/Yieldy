import {
    UPDATECONFIG,
    FETCHUSERCONFIG
} from '../actions/config';

const initialState = {
    userConfig: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCHUSERCONFIG:
            return {
                ...state,
                userConfig: action.userConfig
            };
        case UPDATECONFIG:
            return state;
        default:
            return state;
    }
};