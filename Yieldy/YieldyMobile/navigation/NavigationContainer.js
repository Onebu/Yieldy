import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import ScreenNavigator from './ScreenNavigator';

const NavigationContainer = props => {
  const navRef = useRef();
  const isAuth = useSelector(state => !!state.auth.token);
  const userInfo = useSelector(state => state.auth.userProfile);

  useEffect(() => {
    if (!isAuth) {
      navRef.current.dispatch(
        NavigationActions.navigate({ routeName: 'Auth' })
      );
    }
  }, [isAuth]);

  return <ScreenNavigator ref={navRef} />;
};

export default NavigationContainer;