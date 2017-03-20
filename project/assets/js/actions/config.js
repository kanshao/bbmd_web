import * as types from 'constants';


export function loadConfig(content) {
    return { type: types.LOAD_CONFIG, content };
}
