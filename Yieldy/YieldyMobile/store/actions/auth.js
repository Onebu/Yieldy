import axios from '../../utils/axios';
import { AsyncStorage } from 'react-native';

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
                AsyncStorage.setItem('token', resData.token);
                AsyncStorage.setItem('expirationDate', expirationDate);
                AsyncStorage.setItem('userInfo', JSON.stringify(resData.userInfo));
                AsyncStorage.setItem('refreshToken', resData.refreshToken);
                dispatch(authSuccess(resData.token, resData.userInfo));
                dispatch(checkAuthTimeout(response.data.expiresIn.toString()));
            }
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    };
};

export const logout = () => {
    AsyncStorage.clear();
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
        }, parseFloat(expirationTime));
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
    return async dispatch => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(await AsyncStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(refreshToken());
            } else {
                const userInfo = await AsyncStorage.getItem('userInfo');
                dispatch(authSuccess(token, JSON.parse(userInfo)));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime())));
            }
        }
    };
};

export const refreshToken = () => {
    return async dispatch => {
        try {
            const userInfo =  await AsyncStorage.getItem('userInfo');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            let url = null;
            if (JSON.parse(userInfo).role === "co") {
                url = '/co/refreshToken';
            } else {
                url = '/user/refreshToken';
            }
            const body = {
                userId: JSON.parse(userInfo).id,
                refreshToken: refreshToken,
            };
            const response = await axios.post(url, body)
            const expirationDate = new Date(new Date().getTime() + Number(response.data.expiresIn));
            AsyncStorage.setItem('token', response.data.accessToken);
            AsyncStorage.setItem('expirationDate', expirationDate);
            dispatch({
                type: REFRESH_TOKEN,
                token: response.data.accessToken,
            });
            dispatch(checkAuthTimeout(response.data.expiresIn.toString()));
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
}


export const deleteToken = () => {
    return async (dispatch, getState) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userId = JSON.parse(await AsyncStorage.getItem('userInfo')).id;
            const type = JSON.parse(await AsyncStorage.getItem('userInfo')).role;
            const refreshToken =await AsyncStorage.getItem('refreshToken');
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
            AsyncStorage.clear();
            dispatch({
                type: DELETE_TOKEN,
                message: response.data.message
            });

        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
}
