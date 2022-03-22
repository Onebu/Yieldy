import axios from '../../utils/axios';
import { setError } from './notification';
import { fetchSystemById } from './system';

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
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                content: content,
                system: systemId,
                publisher: publisherId,
                duedate: duedate
            };
            url = '/task/';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.post(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: CREATETASK, createdTask: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const fetchTaskById = (taskId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHTASKBYID, fetchedTaskById: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const deleteTask = (taskId, systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.delete(url, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: DELETETASKBYID });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const assignTechnician = (taskId, technicianId, systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
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
            dispatch(setError(err.response.data.error));
        }
    }
};


export const revokeTechnician = (taskId, technicianId, systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
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
            dispatch(setError(err.response.data.error));
        }
    }
};

export const fetchRelatedTask = () => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            url = '/task/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHRELATEDTASK, fetchedRelated: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const updateTaskById = (taskId, status, systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                status: status
            };
            url = '/task/' + taskId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch(fetchTaskById(taskId));
            dispatch({ type: UPDATETASKBYID });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};