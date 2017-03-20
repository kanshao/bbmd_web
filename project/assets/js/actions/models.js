import _ from 'underscore';

import * as types from 'constants';
import h from 'utils/helpers';


function requestContent() {
    return {
        type: types.REQUEST_MODEL_SETTING,
    };
}

function receiveModelSettings(data){
    return {
        type: types.RECEIVE_MODEL_SETTINGS,
        data: data,
    };
}

function receiveObject(object){
    return {
        type: types.RECEIVE_MODEL_SETTING,
        object,
    };
}

function removeObject(id){
    return {
        type: types.DELETE_MODEL_SETTING,
        id,
    };
}

function fetchObject(id){
    return (dispatch, getState) => {
        let state = getState();
        if (state.models.isFetching) return;
        dispatch(requestContent());
        return fetch(`${state.config.model_root}${id}/`, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveObject(json)))
            .catch((ex) => console.error('Object parsing failed', ex));
    };
}

function receiveModelSettingsPlot(id, json){
    return {
        type: types.RECEIVE_MODEL_SETTINGS_PLOT,
        plot_id: id,
        plot_json: json,
    };
}

function receiveModelSettingsParameterPlot(id, json){
    return {
        type: types.RECEIVE_MODEL_SETTINGS_PARAMETER_PLOT,
        plot_id: id,
        plot_json: json,
    };
}

function resetErrors(){
    return {
        type: types.RESET_MODEL_SETTING_ERRORS,
    };
}

function setErrors(errors){
    return {
        type: types.RECEIVE_MODEL_SETTING_ERRORS,
        errors,
    };
}

function fetchModelSettings() {
    return (dispatch, getState) => {
        let state = getState();
        return fetch(state.config.model_root, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveModelSettings(json)))
            .catch((ex) => console.error('Model settings parsing failed', ex));
    };
}

export function fetchModelSettingsIfNeeded() {
    return (dispatch, getState) => {
        return dispatch(fetchModelSettings());
    };
}

export function fetchModelSettingsPlotIfNeeded(model) {
    return (dispatch, getState) => {
        if (!_.isUndefined(model.plot_json)) return;
        return fetch(model.url_plot, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveModelSettingsPlot(model.id, json)))
            .catch((ex) => console.error('Model settings plot parsing failed', ex));
    };
}

export function fetchModelSettingsParameterPlotIfNeeded(model) {
    return (dispatch, getState) => {
        if (!_.isUndefined(model.parameter_plot_json)) return;
        return fetch(model.url_parameter_plot, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveModelSettingsParameterPlot(model.id, json)))
            .catch((ex) => console.error('Model settings plot parsing failed', ex));
    };
}

export function postObject(post, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, post);
        return fetch(state.config.model_root, opts)
            .then(function(response){
                if (response.status === 201){
                    response.json()
                        .then((json) => dispatch(receiveObject(json)))
                        .then(cb())
                        .then(() => dispatch(resetErrors()));
                } else {
                    response.json()
                        .then((json) => dispatch(setErrors(json)));
                }
            })
            .catch((ex) => console.error('Post failed', ex));
    };
}

export function patchObject(id, patch, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, patch, 'PATCH');
        dispatch(resetErrors());
        return fetch(`${state.config.model_root}${id}/`, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json()
                        .then((json) => dispatch(fetchObject(json.id)))
                        .then(cb())
                        .then(() => dispatch(resetErrors()));
                } else {
                    response.json()
                        .then((json) => dispatch(setErrors(json)));
                }
            })
            .catch((ex) => console.error('Patch failed', ex));
    };
}

export function deleteObject(id, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchDelete(state.config.csrf);
        return fetch(`${state.config.model_root}${id}/`, opts)
            .then(function(response){
                if (response.status === 204){
                    dispatch(removeObject(id));
                    cb(null);
                } else {
                    response.json()
                        .then((json) => cb(json));
                }
            })
            .catch((ex) => console.error('Delete failed', ex));
    };
}
