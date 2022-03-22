import {
    CREATETASK,
    FETCHTASKBYID,
    DELETETASKBYID,
    UPDATETASKBYID,
    ASSIGNTECHNICIAN,
    REVOKETECHNICIAN,
    FETCHRELATEDTASK
} from '../actions/task';

const initialState = {
    createdTask: null,
    fetchedTaskById: null,
    fetchedRelated: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CREATETASK:
            return {
                ...state,
                createdTask: action.createdTask
            };
        case FETCHTASKBYID:
            return {
                ...state,
                fetchedTaskById: action.fetchedTaskById
            }
        case DELETETASKBYID:
            return state;
        case UPDATETASKBYID:
            return state;
        case ASSIGNTECHNICIAN:
            return state;
        case REVOKETECHNICIAN:
            return state;
        case FETCHRELATEDTASK:
            return {
                ...state,
                fetchedRelated: action.fetchedRelated
            }
        default:
            return state;
    }
};