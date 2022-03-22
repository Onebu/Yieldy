import {
    FETCHDEVICEBYID,
    CREATEDEVICE,
    DELETEDEVICE,
    FETCHSTATUS,
    FETCHRELATEDDEVICE,
    FETCHSTATUSLIST,
    FETCHAUDIT,
    FETCHFILE,
    FETCHHEART,
    FETCHMETRIC,
    FETCHPACKET,
    FETCHWINLOG,
    FETCHMETRICLIST
} from '../actions/device';

const initialState = {
    fetchedDevice: null,
    createdDevice: null,
    fetchedStatus: null,
    relatedDevices: null,
    statusList: null,
    deviceAudit: null,
    deviceFile: null,
    deviceHeart: null,
    deviceMetric: null,
    devicePacket: null,
    deviceWinlog: null,
    metricList: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCHDEVICEBYID:
            return {
                ...state,
                fetchedDevice: action.fetchedDevice
            };
        case CREATEDEVICE:
            return {
                ...state,
                createdDevice: action.createdDevice
            }
        case DELETEDEVICE:
            return initialState;
        case FETCHSTATUS:
            return {
                ...state,
                fetchedStatus: action.fetchedStatus
            }
        case FETCHRELATEDDEVICE:
            return {
                ...state,
                relatedDevices: action.relatedDevices
            }
        case FETCHSTATUSLIST:
            return {
                ...state,
                statusList: action.status
            };
        case FETCHMETRICLIST:
            return {
                ...state,
                metricList: action.status
            };
        case FETCHAUDIT:
            return {
                ...state,
                deviceAudit: action.deviceAudit
            };
        case FETCHFILE:
            return {
                ...state,
                deviceFile: action.status
            };
        case FETCHHEART:
            return {
                ...state,
                deviceHeart: action.status
            }
        case FETCHMETRIC:
            return {
                ...state,
                deviceMetric: action.deviceMetric
            };
        case FETCHPACKET:
            return {
                ...state,
                devicePacket: action.status
            }
        case FETCHWINLOG:
            return {
                ...state,
                deviceWinlog: action.status
            };
        default:
            return state;
    }
};