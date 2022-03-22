import axios from '../../utils/axios';
import { setError } from './notification';
import { fetchSystemById } from './system';


export const FETCHDEVICEBYID = 'FETCHDEVICEBYID';
export const CREATEDEVICE = 'CREATEDEVICE';
export const DELETEDEVICE = 'DELETEDEVICE';
export const FETCHSTATUS = 'FETCHSTATUS';
export const FETCHRELATEDDEVICE = 'FETCHRELATEDDEVICE';
export const FETCHSTATUSLIST = 'FETCHSTATUSLIST';
export const FETCHAUDIT = 'FETCHAUDIT';
export const FETCHFILE = 'FETCHFILE';
export const FETCHMETRIC = 'FETCHMETRIC';
export const FETCHHEART = 'FETCHHEART';
export const FETCHWINLOG = 'FETCHWINLOG';
export const FETCHPACKET = 'FETCHPACKET';
export const FETCHMETRICLIST = 'FETCHMETRICLIST';

export const fetchdevicebyid = (deviceId) => {  //change deviceid to statuscode 
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/device/' + deviceId;
            const header = { headers: { Authorization: "Bearer " + token } };
            const response = await axios.get(url, header);
            dispatch({ type: FETCHDEVICEBYID, fetchedDevice: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};


export const createdevice = (name, systemId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/device';
            const header = { headers: { Authorization: "Bearer " + token } };
            const body = {
                name: name,
                system: systemId
            }
            const response = await axios.post(url, body, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: CREATEDEVICE, createDevice: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};

export const deletedevice = (systemId, deviceId) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/device/' + deviceId;
            const header = { headers: { Authorization: "Bearer " + token } };
            await axios.delete(url, header);
            dispatch(fetchSystemById(systemId));
            dispatch({ type: DELETEDEVICE });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
};

export const fetchStatus = (statusCode) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/status/' + statusCode;
            const header = { headers: { Authorization: "Bearer " + token } };
            const response = await axios.get(url, header);
            dispatch({ type: FETCHSTATUS, fetchedStatus: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
}

export const fetchRelatedDevice = () => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = '/device/related';
            const header = { headers: { Authorization: "Bearer " + token } };
            const response = await axios.get(url, header);
            dispatch({ type: FETCHRELATEDDEVICE, relatedDevices: response.data });
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
}

export const fetchStatusList = (statusList) => {
    return async dispatch => {
        try {
            let urlList = [];
            const token = localStorage.getItem('tkn');
            const header = { headers: { Authorization: "Bearer " + token } };
            statusList.map(status => {
                urlList.push('/status/' + status)
            });
            const responses = await Promise.all(urlList.map(url => {
                return axios.get(url, header);
            })).catch(error => {
                throw new Error(error.message)
            });

            dispatch({ type: FETCHSTATUSLIST, status: responses });
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
}

export const fetchMetricList = (statusList) => {
    return async dispatch => {
        try {
            let urlList = [];
            const token = localStorage.getItem('tkn');
            const header = { headers: { Authorization: "Bearer " + token } };
            statusList.map(status => {
                urlList.push('/status/metric/' + status + "/1000/1" )
            });
            const responses = await Promise.all(urlList.map(url => {
                return axios.get(url, header);
            })).catch(error => {
                throw new Error(error.message)
            });

            dispatch({ type: FETCHMETRICLIST, status: responses });
        } catch (err) {
            throw new Error(err.response.data.error);
        };
    }
}


export const fetchAuditByDevice = (statusCode,period,size) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            if (!!period && !!size) {
                url = '/status/audit/' + statusCode + "/" + period + "/" + size;
            } else if (!!period) {
                url = '/status/audit/' + statusCode + "/" + period + "/" + size;
            } else if (!!size) {
                url = '/status/audit/' + statusCode + "/7/" + size;
            } else {
                url = '/status/audit/' + statusCode;
            }
            const header = { headers: { Authorization: "Bearer " + token } };
            const response = await axios.get(url, header);
            dispatch({ type: FETCHAUDIT, deviceAudit: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
}

// export const fetchFileByDevice = (statusCode) => {
//     return async dispatch => {
//         try {
//             const token = localStorage.getItem('tkn');
//             let url = '/status/audit/' + statusCode;
//             const header = { headers: { Authorization: "Bearer " + token } };
//             const response = await axios.get(url, header);
//             dispatch({ type: FETCHSTATUS, deviceFile: response.data });
//         } catch (err) {
//             dispatch(setError(err.response.data.error));
//         };
//     }
// }

// export const fetchHeartByDevice = (statusCode) => {
//     return async dispatch => {
//         try {
//             const token = localStorage.getItem('tkn');
//             let url = '/status/audit/' + statusCode;
//             const header = { headers: { Authorization: "Bearer " + token } };
//             const response = await axios.get(url, header);
//             dispatch({ type: FETCHSTATUS, deviceHeart: response.data });
//         } catch (err) {
//             dispatch(setError(err.response.data.error));
//         };
//     }
// }

// export const fetchPacketByDevice = (statusCode) => {
//     return async dispatch => {
//         try {
//             const token = localStorage.getItem('tkn');
//             let url = '/status/audit/' + statusCode;
//             const header = { headers: { Authorization: "Bearer " + token } };
//             const response = await axios.get(url, header);
//             dispatch({ type: FETCHSTATUS, devicePacket: response.data });
//         } catch (err) {
//             dispatch(setError(err.response.data.error));
//         };
//     }
// }

export const fetchMetricByDevice = (statusCode, period, size) => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('tkn');
            let url = null;
            if (!!period && !!size) {
                url = '/status/metric/' + statusCode + "/" + period + "/" + size;
            } else if (!!period) {
                url = '/status/metric/' + statusCode + "/" + period + "/" + size;
            } else if (!!size) {
                url = '/status/metric/' + statusCode + "/7/" + size;
            } else {
                url = '/status/metric/' + statusCode;
            }
            const header = { headers: { Authorization: "Bearer " + token } };
            const response = await axios.get(url, header);
            dispatch({ type: FETCHMETRIC, deviceMetric: response.data });
        } catch (err) {
            dispatch(setError(err.response.data.error));
        };
    }
}

// export const fetchWinlogByDevice = (statusCode) => {
//     return async dispatch => {
//         try {
//             const token = localStorage.getItem('tkn');
//             let url = '/status/audit/' + statusCode;
//             const header = { headers: { Authorization: "Bearer " + token } };
//             const response = await axios.get(url, header);
//             dispatch({ type: FETCHSTATUS, deviceWinlog: response.data });
//         } catch (err) {
//             dispatch(setError(err.response.data.error));
//         };
//     }
// }