import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import config from './config';
import run from './run';
import models from './models';
import bmds from './bmds';


const reducer = combineReducers({
    router: routerStateReducer,
    config,
    run,
    models,
    bmds,
});

export default reducer;
