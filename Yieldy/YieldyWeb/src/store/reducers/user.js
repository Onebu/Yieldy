import {
    FETCHUSERPROFILE,
    UPDATEUSERNAME,
    CREATEUSER,
    FETCHUSERBYID,
    RESENDUSER,
    DELETEUSER
} from '../actions/user';

const initialState = {
    fetchedUser: null,
    userProfile: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCHUSERPROFILE:
            return {
                ...state,
                userProfile: action.userProfile
            }
        case UPDATEUSERNAME:
            return state;
        case CREATEUSER:
            return state;
        case FETCHUSERBYID:
            return {
                ...state,
                fetchedUser: action.fetchedUser
            }
        case RESENDUSER:
            return state;
        case DELETEUSER:
            return state;
        default:
            return state;
    }
};