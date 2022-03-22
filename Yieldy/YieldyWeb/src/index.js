import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import authReducer from './store/reducers/auth';
import userReducer from './store/reducers/user';
import companyReducer from './store/reducers/company';
import notificationReducer from './store/reducers/notification';
import configReducer from './store/reducers/config';
import systemRecucer from './store/reducers/system';
import deviceReducer from './store/reducers/device';
import taskReducer from './store/reducers/task';
import messageReducer from './store/reducers/message';

const composeEnhancers = (process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null) || compose;

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    company: companyReducer,
    notification: notificationReducer,
    config: configReducer,
    system: systemRecucer,
    device: deviceReducer,
    task: taskReducer,
    message: messageReducer
});

const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk)
));

const app = (
    <Provider store={store}>
        <App />
    </Provider>
);

ReactDOM.render(app, document.getElementById('root'));
