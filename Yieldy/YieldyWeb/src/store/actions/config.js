import axios from '../../utils/axios';
import { setError } from './notification';


export const UPDATECONFIG = 'UPDATECONFIG';
export const FETCHUSERCONFIG = 'FETCHUSERCONFIG';

export const fetchUserConfig = () => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/config/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHUSERCONFIG, userConfig: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};

export const updateConfig = (configId, push) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            const body = {
                pushnotification: push
            };
            const url = '/config/' + configId;
            const header = { headers: { Authorization: "Bearer " + token } }
            await axios.patch(url, body, header);
            dispatch(fetchUserConfig());
            dispatch({ type: UPDATECONFIG });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        }
    }
};