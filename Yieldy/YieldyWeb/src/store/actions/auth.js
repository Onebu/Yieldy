import axios from '../../utils/axios';
import {encrypt, decrypt} from '../../utils/encrypt';

export const SIGNUP = 'SIGNUP';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const RESEND = 'RESEND';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const DELETE_TOKEN = 'DELETE_TOKEN';

export const authSuccess = (token, userInfo, refreshToken) => {
    return dispatch => {
        dispatch({
            type: AUTH_SUCCESS,
            userInfo: userInfo,
            token: token
        });
    };
};

export const signup = (username, email, password) => {
    return async dispatch => {
        try {
            const Body = {
                username: username,
                password: password,
                email: email,
                role: 'co'
            }
            let url = '/co/signup';
            const response = await axios.post(url, Body);
            if (response.data) {
                dispatch({ type: SIGNUP, message: response.data.message });
            }
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    };
};

export const login = (identificator, password, type) => {
    return async (dispatch, getState) => {
        try {
            let authData = null;
            let url = null;
            if (type === "co") {
                authData = {
                    email: identificator,
                    password: password,
                };
                url = '/co/login';
            } else {
                authData = {
                    username: identificator,
                    password: password,
                };
                url = '/user/login';
            }
            const response = await axios.post(url, authData);
            if (!!response && response.data) {
                const resData = await response.data;
                const expirationDate = new Date(new Date().getTime() + Number(resData.expiresIn));
                localStorage.setItem('tkn', resData.token);
                localStorage.setItem('exp', expirationDate);
                localStorage.setItem('uuid', JSON.stringify(resData.userInfo));
                localStorage.setItem('rtk', encrypt(resData.refreshToken));
                dispatch(authSuccess(resData.token, resData.userInfo));
                dispatch(checkAuthTimeout(response.data.expiresIn));
            }
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    };
};

export const logout = () => {
    localStorage.clear();
    return dispatch => {
        dispatch({
            type: LOGOUT
        });
    }
}

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(refreshToken());
        }, expirationTime);
    };
};

export const resend = (identificator, type) => {
    return async (dispatch, getState) => {
        try {
            let authData = null;
            let url = null;
            if (type === "co") {
                authData = {
                    email: identificator
                };
                url = '/co/resend';
            } else {
                authData = {
                    username: identificator
                }
                url = '/user/resend';
            }
            const response = await axios.post(url, authData);
            const resData = await response.data;
            if (resData) {
                dispatch({ type: RESEND });
            }
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('tkn');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('exp'));
            if (expirationDate <= new Date()) {
                dispatch(refreshToken());
            } else {
                const userInfo = localStorage.getItem('uuid');
                dispatch(authSuccess(token, userInfo));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime())));
            }
        }
    };
};

export const refreshToken = () => {
    return async dispatch => {
        try {
            const userId = JSON.parse(localStorage.getItem('uuid')).id;
            const type = JSON.parse(localStorage.getItem('uuid')).role;
            const refreshToken = decrypt(localStorage.getItem('rtk'));
            let url = null;
            if (type === "co") {
                url = '/co/refreshToken';
            } else {
                url = '/user/refreshToken';
            }
            const body = {
                userId: userId,
                refreshToken: refreshToken,
            };
            const response = await axios.post(url, body);
            const expirationDate = new Date(new Date().getTime() + Number(response.data.expiresIn));
            localStorage.setItem('tkn', response.data.accessToken);
            localStorage.setItem('exp', expirationDate);
            dispatch({
                type: REFRESH_TOKEN,
                token: response.data.accessToken,
            });
            dispatch(checkAuthTimeout(Number(response.data.expiresIn)));
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
}


export const deleteToken = () => {
    return async (dispatch, getState) => {
        try {
            const token = localStorage.getItem('tkn');
            const userId = JSON.parse(localStorage.getItem('uuid')).id;
            const type = JSON.parse(localStorage.getItem('uuid')).role;
            const refreshToken = decrypt(localStorage.getItem('rtk'));
            let url = null;
            if (type === "co") {
                url = '/co/deleteToken';
            } else {
                url = '/user/deleteToken';
            }
            const header = { headers: { Authorization: "Bearer " + token } }
            const body = {
                userId: userId,
                refreshToken: refreshToken,
            };
            const response = await axios.post(url, body, header);
            localStorage.clear();
            dispatch({
                type: DELETE_TOKEN,
                message: response.data.message
            });

        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
}
