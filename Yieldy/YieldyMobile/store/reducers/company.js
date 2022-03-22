import {
    FETCHEDCOMPANY,
    CREATECOMPANY,
    UPDATECOMPANY
} from '../actions/company';

const initialState = {
    companies: [],
    createdCompany: null,

};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCHEDCOMPANY:
            return {
                ...state,
                companies: action.companies
            };
        case CREATECOMPANY:
            return {
                ...state,
                createdCompany: action.createdCompany
            }
        case UPDATECOMPANY:
            return {
                ...state,
                createdCompany: action.createdCompany
            }
        default:
            return state;
    }
};