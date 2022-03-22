import axios from '../../utils/axios';
import { AsyncStorage } from 'react-native';


export const UPDATECONFIG = 'UPDATECONFIG';
export const FETCHUSERCONFIG = 'FETCHUSERCONFIG';

export const fetchUserConfig = () => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = '/config/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHUSERCONFIG, userConfig: response.data });
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
};

export const updateConfig = (configId, push) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            const body = {
                pushnotification: push
            };
            const url = '/config/' + configId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchUserConfig());
            dispatch({ type: UPDATECONFIG });
        } catch (err) {
            throw new Error(err.response.data.error);
        }
    }
};