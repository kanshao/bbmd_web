import _ from 'underscore';

import * as types from 'constants';
import h from 'utils/helpers';


function requestContent() {
    return {
        type: types.REQUEST_BMDs,
    };
}

function receiveBmds(data){
    return {
        type: types.RECEIVE_BMDs,
        data: data,
    };
}

function receiveObject(object){
    return {
        type: types.RECEIVE_BMD,
        object,
    };
}

function removeObject(id){
    return {
        type: types.DELETE_BMD,
        id,
    };
}

function fetchObject(id){
    return (dispatch, getState) => {
        let state = getState();
        if (state.bmds.isFetching) return;
        dispatch(requestContent());
        return fetch(`${state.config.benchmark_dose_root}${id}/`, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveObject(json)))
            .catch((ex) => console.error('Object parsing failed', ex));
    };
}

function requestBmdPlot(id){
    return {
        type: types.REQUEST_BMD_PLOT,
        id,
    };
}

function receiveBmdPlot(id, json){
    return {
        type: types.RECEIVE_BMD_PLOT,
        plot_id: id,
        plot_json: json,
    };
}

function fetchBmds() {
    return (dispatch, getState) => {
        let state = getState();
        return fetch(state.config.benchmark_dose_root, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveBmds(json)))
            .catch((ex) => console.error('BMDS parsing failed', ex));
    };
}

function resetErrors(){
    return {
        type: types.RESET_BMD_ERRORS,
    };
}

function setErrors(errors, is500){
    return {
        type: types.RECEIVE_BMD_ERRORS,
        errors,
        is500,
    };
}

function selectBmd(id){
    return {
        type: types.SELECT_BMD,
        id,
    };
}

function deselectBmd(){
    return {
        type: types.DESELECT_BMD,
    };
}

export function fetchBmdsIfNeeded() {
    return (dispatch, getState) => {
        return dispatch(fetchBmds());
    };
}

export function fetchBmdPlotIfNeeded(bmd) {
    if (!bmd.id) return;
    if (!_.isUndefined(bmd.plot_json)) return;
    return (dispatch, getState) => {
        let state = getState();
        if (state.bmds.isFetchingPlot[bmd.id]) return;
        dispatch(requestBmdPlot(bmd.id));
        return fetch(bmd.url_plot, h.fetchGet)
            .then(response => response.json())
            .then(json => dispatch(receiveBmdPlot(bmd.id, json)))
            .catch((ex) => console.error('BMD plot parsing failed', ex));
    };
}

export function postObject(post, cb){
    cb = cb || h.noop;
    return (dispatch, getState) => {
        let state = getState(),
            opts = h.fetchPost(state.config.csrf, post);
        return fetch(state.config.benchmark_dose_root, opts)
            .then(function(response){
                if (response.status === 201){
                    response.json()
                        .then((json) => dispatch(receiveObject(json)))
                        .then(cb())
                        .then(() => dispatch(resetErrors()));
                } else {
                    if( response.status === 500){
                        dispatch(setErrors(null, true));
                    } else {
                        response.json()
                            .then((json) => dispatch(setErrors(json, false)));
                    }
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
        return fetch(`${state.config.benchmark_dose_root}${id}/`, opts)
            .then(function(response){
                if (response.status === 200){
                    response.json()
                        .then((json) => dispatch(fetchObject(json.id)))
                        .then(cb())
                        .then(() => dispatch(resetErrors()));
                } else {
                    if( response.status === 500){
                        dispatch(setErrors(null, true));
                    } else {
                        response.json()
                            .then((json) => dispatch(setErrors(json, false)));
                    }
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
        return fetch(`${state.config.benchmark_dose_root}${id}/`, opts)
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

export function changeSelectedBmd(id){
    return (dispatch, getState) => {
        if (id){
            dispatch(selectBmd(id));
        } else {
            dispatch(deselectBmd());
        }
    };
}
