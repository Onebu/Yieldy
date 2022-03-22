import axios from '../../utils/axios';
import { setError } from './notification';
import { fetchCompany } from './company';

export const FETCHSYSTEMBYID = 'FETCHSYSTEMBYID';
export const CREATESYSTEM = 'CREATESYSTEM';
export const DELETESYSTEM = 'DELETESYSTEM';
export const ASSIGNADMIN = 'ASSIGNADMIN';
export const ASSIGNTECHNICIAN = 'ASSIGNTECHINICIAN';
export const REVOKEADMIN = 'REVOKEADMIN';
export const REVOKETECHNICIAN = 'REVOKETECHNICIAN';

export const fetchSystemById = (systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/system/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHSYSTEMBYID, fetchedSystem: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};


export const createSystem = (name) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                name: name
            };
            url = '/system/';
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.post(url, body, header);
            dispatch(fetchCompany());
            dispatch({ type: CREATESYSTEM });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const deleteSystem = (systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            url = '/system/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.delete(url, header);
            dispatch(fetchCompany());
            dispatch({ type: DELETESYSTEM });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const assignadmin = (systemId, adminId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                id: adminId
            };
            url = '/system/addadmin/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: ASSIGNADMIN });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    };
}

export const assigntechnician = (systemId, technicianId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                id: technicianId
            };
            url = '/system/addtechnician/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: ASSIGNTECHNICIAN });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    };
};


export const revokeadmin = (systemId, adminId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                id: adminId
            };
            url = '/system/removeadmin/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: REVOKEADMIN });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    };
};

export const revoketechnician = (systemId, technicianId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                id: technicianId
            };
            url = '/system/removetechnician/' + systemId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: REVOKETECHNICIAN });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    };
};