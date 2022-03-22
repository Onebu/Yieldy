import React, { useState, useEffect } from 'react';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { enableScreens } from 'react-native-screens';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';

import NavigationContainer from './navigation/NavigationContainer';
import authReducer from './store/reducers/auth';
import companyReducer from './store/reducers/company';
import userReducer from './store/reducers/user';
import systemReducer from './store/reducers/system';
import deviceReducer from './store/reducers/device';
import messageReducer from './store/reducers/message';
import taskReducer from './store/reducers/task';
import configReducer from './store/reducers/config';
import AppContainer from './utils/notification';
import { View } from 'native-base';

enableScreens();

const rootReducer = combineReducers({
  auth: authReducer,
  company: companyReducer,
  user: userReducer,
  system: systemReducer,
  device: deviceReducer,
  message: messageReducer,
  task: taskReducer,
  config: configReducer
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf')
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);


  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
      />
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer />
    </Provider>
  );
}