import axios from '../../utils/axios';
import { setError } from './notification';
import { fetchCompany } from './company';

export const FETCHUSERPROFILE = 'FETCHUSERPROFILE';
export const UPDATEUSERNAME = 'UPDATEUSERNAME';
export const EDITIMAGE = 'EDITIMAGE';
export const CREATEUSER = 'CREATEUSER';
export const FETCHUSERBYID = 'FETCHUSERBYID';
export const DELETEUSER = 'DELETEUSER';
export const RESENDUSER = 'RESENDUSER';

export const fetchUserProfile = () => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/user/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHUSERPROFILE, userProfile: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
}

export const updateUsername = (name, type) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            const userId = JSON.parse(localStorage.getItem('uuid')).id;
            let body = null;
            let url = null;
            if (type === "co") {
                body = {
                    username: name
                };
                url = '/co/' + userId;
            } else {
                body = {
                    username: name
                };
                url = '/user/' + userId;
            }
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchUserProfile());
            dispatch({ type: UPDATEUSERNAME });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
}

export const editImage = (imageName, image, type) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let formData = new FormData();
            let url = null;
            if (type === "co") {
                formData.append('imageName', imageName);
                formData.append('cloudImage', image);
                url = '/co/profileImage';
            } else {
                formData.append('imageName', imageName);
                formData.append('cloudImage', image);
                url = '/user/profileImage';
            }
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, formData, header);
            dispatch(fetchUserProfile());
            dispatch({ type: EDITIMAGE });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
}

export const createUser = (role, email) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                role: role,
                email: email
            };
            url = '/user/create';
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.post(url, body, header);
            dispatch({ type: CREATEUSER });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const fetchUserById = (userId, role) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            if (role === 'co') {
                url = '/co/' + userId;
            } else {
                url = '/user/' + userId;
            }
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHUSERBYID, fetchedUser: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const resend = (username) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let body = null;
            let url = null;
            body = {
                username: username
            };
            url = '/user/resend';
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.post(url, body, header);
            dispatch({ type: RESENDUSER });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};

export const deleteUser = (id) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            url = '/user/' + id;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.delete(url, header);
            dispatch(fetchCompany());
            dispatch({ type: DELETEUSER });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};