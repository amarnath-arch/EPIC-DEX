import thunk from 'redux-thunk';
import {applyMiddleware, createStore, combineReducers} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import {
    provider,
    tokens,
    exchange
} from "./reducers";

const reducers = combineReducers({
    provider,
    tokens,
    exchange
});

const middleware = [thunk];
const initialState={};

const store = createStore(reducers,initialState,composeWithDevTools(applyMiddleware(...middleware)));

export default store;