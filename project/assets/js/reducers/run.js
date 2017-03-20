import * as types from 'constants';


let defaultState = {
    isFetching: false,
    object: null,
    editObjectErrors: null,
    executionStartTime: null,
    executionEndTime: null,
    serverError: false,
};

export default function (state = defaultState, action) {
    switch (action.type) {
    case types.REQUEST_RUN:
        return Object.assign({}, state, {
            isFetching: true,
        });
    case types.RECEIVE_RUN:
        return Object.assign({}, state, {
            isFetching: false,
            object: action.data,
        });
    case types.RUN_EXECUTE_START:
        return Object.assign({}, state, {
            executionStartTime: action.startTime,
            executionEndTime: null,
            serverError: false,
        });
    case types.RUN_EXECUTE_ERROR:
        return Object.assign({}, state, {
            serverError: true,
        });
    case types.RUN_EXECUTE_END:
        return Object.assign({}, state, {
            executionEndTime: action.endTime,
        });
    case types.RECEIVE_RUN_PLOT:
        state.object.plot_json = action.plot_json;
        return Object.assign({}, state);
    case types.RESET_RUN_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: null,
        });
    case types.RECEIVE_RUN_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: action.errors,
        });
    default:
        return state;
    }
}
