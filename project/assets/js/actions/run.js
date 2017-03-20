import moment from 'moment';

import * as types from 'constants';
import h from 'utils/helpers';


function requestContent() {
    return {
        type: types.REQUEST_RUN,
    };
}

function receiveObject(data){
    return {
        type: types.RECEIVE_RUN,
        data: data,
    };
}

function receiveRunPlot(json){
    return {
        type: types.RECEIVE_RUN_PLOT,
        plot_json: json,
    };
}

function fetchObject() {
    return (dispatch, getState) => {
        let state = getState();
        if (state.run.isFetching) return;
        dispatch(requestContent());
        return fetch(state.config.run_object, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveObject(json)))
            .then(() => dispatch(fetchRunPlot(getState().run.object.url_plot)))
            .catch((ex) => console.error('Run parsing failed', ex));
    };
}

function resetErrors(){
    return {
        type: types.RESET_RUN_ERRORS,
    };
}

function setErrors(errors){
    return {
        type: types.RECEIVE_RUN_ERRORS,
        errors,
    };
}

function startExecution(){
    return {
        type: types.RUN_EXECUTE_START,
        startTime: new Date(),
    };
}

function endExecution(){
    return {
        type: types.RUN_EXECUTE_END,
        endTime: new Date(),
    };
}

function executionError(){
    return {
        type: types.RUN_EXECUTE_ERROR,
    };
}

export function execute(){
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, {}),
            intervalId = window.setInterval(() => {
                document.getElementById('executionTimeDiv').textContent =
                    moment(getState().run.executionStartTime).fromNow();
            }, 5000);

        dispatch(startExecution());
        fetch(state.run.object.url_execute, opts)
            .then(response => response.json())
            .then(json => {
                if (json.isComplete){
                    window.clearInterval(intervalId);
                    dispatch(endExecution());
                }
            }).catch((ex) => {
                console.error('Execute failed', ex);
                dispatch(executionError());
            });
    };
}

export function fetchRunIfNeeded() {
    return (dispatch, getState) => {
        return dispatch(fetchObject());
    };
}

export function fetchRunPlot(url) {
    return (dispatch, getState) => {
        return fetch(url, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveRunPlot(json)))
            .catch((ex) => console.error('Run plot parsing failed', ex));
    };
}

export function patchObject(id, patch, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, patch, 'PATCH');
        dispatch(resetErrors());
        return fetch(state.config.run_object, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json()
                        .then((json) => dispatch(fetchObject(json.id)));
                } else {
                    response.json()
                        .then((json) => dispatch(setErrors(json)));
                }
            })
            .catch((ex) => console.error('Patch failed', ex));
    };
}
