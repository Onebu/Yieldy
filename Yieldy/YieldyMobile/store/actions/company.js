import axios from '../../utils/axios';
import { AsyncStorage } from 'react-native';

export const FETCHEDCOMPANY = 'FETCHEDCOMPANY';
export const CREATECOMPANY = 'CREATECOMPANY';
export const UPDATECOMPANY = 'UPDATECOMPANY';

export const fetchCompany = () => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = '/company/me';
            const header = { headers: { Authorization: "Bearer " + token } }
            const response = await axios.get(url, header);
            dispatch({ type: FETCHEDCOMPANY, companies:  response.data});
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
};

export const createCompany = (name, email, website, address, phone, description) => {
    return async dispatch => {
        try {
            const token = await AsyncStorage.getItem('token');
            let url = '/company';
            const header = { headers: { Authorization: "Bearer " + token } };
            const body = {
                name: name,
                email: email,
                website:website,
                address: address,
                phone: phone,
                description: description
            }
            const response = await axios.post(url,body, header);
            dispatch({ type: CREATECOMPANY, createdCompany:  response.data});
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
}

export const updateCompany = ( id, email, website, address, phone, description) => {
    return async dispatch => {
        try {
            const token =await AsyncStorage.getItem('token');
            let url = '/company/'+id;
            const header = { headers: { Authorization: "Bearer " + token } };
            const body = {
                email: email,
                website:website,
                address: address,
                phone: phone,
                description: description
            }
            const response = await axios.patch(url,body, header);
            dispatch({ type: UPDATECOMPANY, createdCompany:  response.data});
            dispatch(fetchCompany());
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
}