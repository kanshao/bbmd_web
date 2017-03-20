import { createHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import { ReduxRouter, reduxReactRouter } from 'redux-router';
import { Route } from 'react-router';
import { Provider } from 'react-redux';

import { loadConfig } from 'actions/config';
import App from 'containers/App';
import reducer from 'reducers';
import { devMiddleware, renderDevTools } from 'utils/devTools';

import 'utils/polyfills';


let middleware = [ thunk ];
const store = compose(
    applyMiddleware(...middleware),
    reduxReactRouter({ createHistory }),
    devMiddleware()
)(createStore)(reducer);


class Root extends React.Component {

    componentWillMount() {
        let config = JSON.parse(document.getElementById('config').textContent);
        store.dispatch(loadConfig(config));
    }

    render() {
        return (
            <div>
                <Provider store={store}>
                    <ReduxRouter>
                        <Route path='/run/:runID/(update/)' component={App}>
                        </Route>
                    </ReduxRouter>
                </Provider>
                {renderDevTools(store)}
            </div>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById('react-main'));
