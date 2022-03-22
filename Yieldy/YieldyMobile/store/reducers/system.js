import {
    FETCHSYSTEMBYID,
    CREATESYSTEM,
    DELETESYSTEM,
    ASSIGNADMIN,
    ASSIGNTECHNICIAN,
    REVOKEADMIN,
    REVOKETECHNICIAN,
    ADDPUSHNODE
} from '../actions/system';

const initialState = {
    systemInfo: null,
    nodeResponse: null,
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
        case ADDPUSHNODE:
            return {
                ...state,
                nodeResponse: action.nodeResponse
            }
        default:
            return state;
    }
};