import {
    CREATEMESSAGE,
    FETCHMESSAGEBYSYSTEM,
    REPLYMESSAGE,
    FETCHMESSAGEBYID
} from '../actions/message';

const initialState = {
    createdMessage: null,
    fetchedMessages: null,
    messageById: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CREATEMESSAGE:
            return {
                ...state,
                createdMessage: action.createdMessage
            };
        case FETCHMESSAGEBYSYSTEM:
            return {
                ...state,
                fetchedMessages: action.fetchedMessages
            }
        case REPLYMESSAGE:
            return {
                ...state,
                createdMessage: action.createdMessage
            }
        case FETCHMESSAGEBYID:
            return {
                ...state,
                messageById: action.messageById
            }
        default:
            return state;
    }
};