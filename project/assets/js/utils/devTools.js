import React from 'react';
import { devTools } from 'redux-devtools';
import {
    DevTools,
    DebugPanel,
    LogMonitor
} from 'redux-devtools/lib/react';


var devMiddleware;
if (__DEBUG__) {
    devMiddleware = devTools;
} else {
    devMiddleware = store => next => action => {
        return next(action);
    };
}

var renderDevTools = function (store) {
    if (__DEBUG__) {
        return (
            <DebugPanel top right bottom>
                <DevTools visibleOnLoad={false} store={store} monitor={LogMonitor} />
            </DebugPanel>
        );
    }
    return null;
};


export {devMiddleware as devMiddleware};
export {renderDevTools as renderDevTools};
