import axios from '../../utils/axios';
import { fetchSystemById } from './system';
import { AsyncStorage } from 'react-native';

export const CREATETASK = 'CREATETASK';
export const FETCHTASKBYID = 'FETCHTASKBYID';
export const DELETETASKBYID = 'DELETETASKBYID';
export const UPDATETASKBYID = 'UPDATETASKBYID';
export const ASSIGNTECHNICIAN = 'ASSIGNTECHNICIAN';
export const REVOKETECHNICIAN = 'REVOKETECHINICIAN';
export const FETCHRELATEDTASK = 'FETCHRELATEDTASK';



export const createtask = (content, duedate, systemId, publisherId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            const node = await AsyncStorage.getItem('pushNode');
            let body = null;
            let url = null;
            body = {
                content: content,
                system: systemId,
                publisher: publisherId,
                duedate: duedate,
                pushNode: node
            };
            url = '/task/';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.post(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: CREATETASK, createdTask: response.data });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};

export const fetchTaskById = (taskId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = null;
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHTASKBYID, fetchedTaskById: response.data });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};

export const deleteTask = (taskId, systemId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = null;
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.delete(url, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: DELETETASKBYID });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};

export const assignTechnician = (taskId, technicianId, systemId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let body = null;
            let url = null;
            body = {
                userId: technicianId
            };
            url = '/task/assign/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchTaskById(taskId));
            dispatch({ type: ASSIGNTECHNICIAN });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};


export const revokeTechnician = (taskId, technicianId, systemId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let body = null;
            let url = null;
            body = {
                userId: technicianId
            };
            url = '/task/revoke/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchTaskById(taskId));
            dispatch({ type: REVOKETECHNICIAN });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};

export const fetchRelatedTask = () => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = null;
            url = '/task/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHRELATEDTASK, fetchedRelated: response.data });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};

export const updateTaskById = (taskId, status, systemId) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            const node = await AsyncStorage.getItem('pushNode');
            let body = null;
            let url = null;
            body = {
                status: status,
                pushNode: node
            };
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchTaskById(taskId));
            dispatch({ type: UPDATETASKBYID });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};