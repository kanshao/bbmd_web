import _ from 'underscore';

import * as types from 'constants';


let defaultState = {
    isFetching: false,
    objects: null,
    editObjectErrors: null,
    selectedObjectId: null,
    isFetchingPlot: {},
    serverError: false,
};

export default function (state=defaultState, action) {
    let model, index, objects, isFetchingPlot;
    switch (action.type) {
    case types.REQUEST_BMDs:
        return Object.assign({}, state, {
            isFetching: true,
        });
    case types.RECEIVE_BMDs:
        return Object.assign({}, state, {
            objects: action.data,
            isFetching: false,
        });
    case types.RECEIVE_BMD:
        action.object.plot_json = undefined;
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
            selectedObjectId: null,
            objects,
        });
    case types.DELETE_BMD:
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
            selectedObjectId: null,
            objects,
        });
    case types.SELECT_BMD:
        return Object.assign({}, state, {
            selectedObjectId: action.id,
        });
    case types.DESELECT_BMD:
        return Object.assign({}, state, {
            selectedObjectId: null,
        });
    case types.RESET_BMD_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: null,
            serverError: false,
        });
    case types.RECEIVE_BMD_ERRORS:
        return Object.assign({}, state, {
            editObjectErrors: action.errors,
            serverError: action.is500,
        });
    case types.REQUEST_BMD_PLOT:
        isFetchingPlot = Object.assign({}, state.isFetchingPlot);
        isFetchingPlot[action.id] = true;
        return Object.assign({}, state, {
            isFetchingPlot,
        });
    case types.RECEIVE_BMD_PLOT:
        isFetchingPlot = Object.assign({}, state.isFetchingPlot);
        delete isFetchingPlot[action.plot_id];
        model = _.findWhere(state.objects, {id: action.plot_id});
        index = state.objects.indexOf(model);
        objects = [
            ...state.objects.slice(0, index),
            _.extend({}, model, {plot_json: action.plot_json}),
            ...state.objects.slice(index+1),
        ];
        return Object.assign({}, state, {
            objects,
            isFetchingPlot,
        });
    default:
        return state;
    }
}
