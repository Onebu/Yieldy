import React, { useEffect, useRef, useEffectc } from 'react';
import NotificationSystem from 'react-notification-system';
import { Card, Col, Row } from 'reactstrap';
import {
  MdImportantDevices,
} from 'react-icons/md';

import AuthForm, { STATE_LOGIN } from 'components/Form/AuthFormCo';
import { NOTIFICATION_SYSTEM_STYLE } from 'utils/constants';

const AuthPageCo = props => {

  const notificationSystemRef = useRef();

  const handleAuthState = authState => {
    if (authState === STATE_LOGIN) {
      props.history.push('/login');
    } else {
      props.history.push('/signup');
    }
  };

  const handleLogoClick = () => {
    props.history.push('/home');
  };

  useEffect(() => {
    const notification = notificationSystemRef.current;

    setTimeout(() => {
      if (!notification) {
        return;
      }

      notification.addNotification({
        title: <MdImportantDevices />,
        message: 'Click Icon to go back!',
        level: 'info',
      });
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Row
      style={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Col md={6} lg={4}>
        <Card body>
          <AuthForm
            userType={"Company Owner"}
            authState={props.authState}
            onChangeAuthState={handleAuthState}
            onLogoClick={handleLogoClick}
          />
        </Card>
        <NotificationSystem
          dismissible={false}
          ref={notificationSystemRef}
          style={NOTIFICATION_SYSTEM_STYLE}
        />
      </Col>
    </Row>
  );
}

export default AuthPageCo;
