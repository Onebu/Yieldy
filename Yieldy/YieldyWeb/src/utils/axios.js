import axios from 'axios';

const instance = axios.create({
    // baseURL: 'https://yieldyapi.herokuapp.com/'
    baseURL: 'http://localhost:5000'
});

axios.defaults.baseURL = 'http://localhost:5000';
//axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
//axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(request => {
    // Edit request config
    return request;
}, error => {
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    // Edit request config
    return response;
}, error => {
    return Promise.reject(error);
});

// instance.interceptors.request...

export default instance;