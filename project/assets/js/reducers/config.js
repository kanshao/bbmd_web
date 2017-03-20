import * as types from 'constants';


export default function config(state = {}, action) {
    switch (action.type) {
    case types.LOAD_CONFIG:
        return action.content;
    default:
        return state;
    }
}
