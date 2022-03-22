import {
    FETCHSYSTEMBYID,
    CREATESYSTEM,
    DELETESYSTEM,
    ASSIGNADMIN,
    ASSIGNTECHNICIAN,
    REVOKEADMIN,
    REVOKETECHNICIAN
} from '../actions/system';

const initialState = {
    systemInfo: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCHSYSTEMBYID:
            return {
                ...state,
                systemInfo: action.fetchedSystem
            };
        case CREATESYSTEM:
            return state;
        case DELETESYSTEM:
            return state;
        case ASSIGNADMIN:
            return state;
        case ASSIGNTECHNICIAN:
            return state;
        case REVOKEADMIN:
            return state;
        case REVOKETECHNICIAN:
            return state;
        default:
            return state;
    }
};