export const SET_ERROR = 'SETERROR';
export const RESET = 'RESET';

export const setError = (error) => {
    return dispatch => {
        dispatch({ type: SET_ERROR, error: error });
    };
}

export const reset = () => {
    return dispatch => {
        dispatch({ type: RESET });
    };
}