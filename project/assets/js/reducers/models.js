import _ from 'underscore';

import * as types from 'constants';


let defaultState = {
    isFetching: false,
    objects: [],
    editObjectErrors: null,
};

export default function (state = defaultState, action) {
    let model, index, objects;
    switch (action.type) {
    case types.REQUEST_MODEL_SETTING:
        return Object.assign({}, state, {
            isFetching: true,
        });
    case types.RECEIVE_MODEL_SETTING:
        index = state.objects.indexOf(
            _.findWhere(state.objects, {id: action.object.id})
        );
        if (index>=0){
            objects = [
                ...state.objects.slice(0, index),
                action.object,
                ...state.objects.slice(index+1),
            ];
        } else {
            objects = [
                ...state.objects,
                action.object,
            ];
        }
        return Object.assign({}, state, {
            isFetching: false,
            objects,
        });
    case types.DELETE_MODEL_SETTING:
        index = state.objects.indexOf(
            _.findWhere(state.objects, {id: action.id})
        );
        if (index>=0){
            objects = [
                ...state.objects.slice(0, index),
                ...state.objects.slice(index+1),
            ];
        }

        return Object.assign({}, state, {
            isFetching: false,
            objects,
        });
    case types.RESET_MODEL_SETTING_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: null,
        });
    case types.RECEIVE_MODEL_SETTING_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: action.errors,
        });
    case types.REQUEST_MODEL_SETTINGS:
        return Object.assign({}, state, {
            isFetching: true,
        });
    case types.RECEIVE_MODEL_SETTINGS:
        return Object.assign({}, state, {
            objects: action.data,
            isFetching: false,
        });
    case types.RECEIVE_MODEL_SETTINGS_PLOT:
        model = _.findWhere(state.objects, {id: action.plot_id});
        index = state.objects.indexOf(model);
        objects = [
            ...state.objects.slice(0, index),
            _.extend({}, model, {plot_json: action.plot_json}),
            ...state.objects.slice(index+1),
        ];
        return Object.assign({}, state, {
            objects: objects,
        });
    case types.RECEIVE_MODEL_SETTINGS_PARAMETER_PLOT:
        model = _.findWhere(state.objects, {id: action.plot_id});
        index = state.objects.indexOf(model);
        objects = [
            ...state.objects.slice(0, index),
            _.extend({}, model, {parameter_plot_json: action.plot_json}),
            ...state.objects.slice(index+1),
        ];
        return Object.assign({}, state, {
            objects: objects,
        });
    default:
        return state;
    }
}
