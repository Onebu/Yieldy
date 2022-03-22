import axios from '../../utils/axios';
import { setError } from './notification';
import { fetchSystemById } from './system';

export const CREATEMESSAGE = 'CREATEMESSAGE';
export const FETCHMESSAGEBYSYSTEM = 'FETCHMESSAGEBYSYSTEM';
export const REPLYMESSAGE = 'REPLYMESSAGE';
export const FETCHMESSAGEBYID = 'FETCHMESSAGEBYID';

export const fetchMessageBySystem = (systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/message/system/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: FETCHMESSAGEBYSYSTEM, fetchedMessages: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const fetchMessageById = (msgId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/message/' + msgId;
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHMESSAGEBYID, messageById: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};


export const createMessage = (content, systemId, deviceId, taskId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/message/';
            const header = { headers: { Authorization: "Bearer " + token } };
            const body = {
                content: content,
                system: systemId,
                device: deviceId,
                task: taskId
            }
            const response = await axios.post(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchMessageBySystem(systemId));
            dispatch({ type: CREATEMESSAGE, createdMessage: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};

export const replyMessage = (content, replyTo,systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/message/reply';
            const header = { headers: { Authorization: "Bearer " + token } };
            const body = {
                content: content,
                replyto: replyTo
            }
            const response = await axios.post(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchMessageBySystem(systemId));
            dispatch({ type: REPLYMESSAGE, createdMessage: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};