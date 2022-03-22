import React, { useState, useEffect, useRef } from 'react';
import {
  MdError
} from 'react-icons/md';
import { Redirect } from 'react-router-dom';
import NotificationSystem from 'react-notification-system';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {Button } from 'antd';

import { Content, Footer, Header, Sidebar } from 'components/Layout';
import { NOTIFICATION_SYSTEM_STYLE } from 'utils/constants';
import * as authActions from '../../store/actions/auth';
import * as userActions from '../../store/actions/user';
import * as notificationActions from '../../store/actions/notification';
import {RegCompany} from 'components/Form/';

const MainLayout = props => {

  const [isOpen, setIsOpen] = useState(true);
  const notificationSystemRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [nestedModal, setNestedModal] = useState(false);
  const [message, setMessage] = useState('');
  const profile = useSelector(state => state.user.userProfile);
  const err = useSelector(state => state.notification.error);
  const [redirect, setRedirect] = useState(false);
  const dispatch = useDispatch();
  const { children } = props;
  let content = children;

  const handleResize = e => {
    setIsOpen(window.innerWidth >= 768);
  };

  const isSidebarOpen = () => {
    return document
      .querySelector('.cr-sidebar')
      .classList.contains('cr-sidebar--open');
  }

  //Execute onComponentDIdMount
  useEffect(() => {
    checkBreakpoint(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    setIsOpen(isSidebarOpen());
    setIsLoading(false);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handle window size change
  useEffect(() => {
    checkBreakpoint(isOpen);
    return () => { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  //Handle error from redux
  useEffect(() => {
    if (err) {
      const notification = notificationSystemRef.current;
      setTimeout(() => {
        if (!notification) {
          return;
        }

        notification.addNotification({
          title: <MdError />,
          message: err,
          level: 'error',
        });
      }, 1000);
      dispatch(notificationActions.reset());
    }
  }, [err,dispatch])

  //handleContentClick&checkBreakpoint&openSidebar are function that handle actions while current window size changes
  const handleContentClick = event => {
    if (
      isSidebarOpen() &&
      (!isOpen)
    ) {
      openSidebar('close');
    }
  };
  const checkBreakpoint = (open) => {
    if (!open) {
      openSidebar('close');
    }
    else {
      openSidebar('open');
    }
  }
  const openSidebar = (openOrClose) => {
    if (openOrClose === 'open') {
      return document
        .querySelector('.cr-sidebar')
        .classList.add('cr-sidebar--open');
    }
    document.querySelector('.cr-sidebar').classList.remove('cr-sidebar--open');
  }

  //Handle logout action
  const logoutHandler = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        authActions.deleteToken()
      );
      setRedirect(true);
    } catch (err) {
      dispatch(notificationActions.setError(err.message));
    }
  }

  //Nested company register modal handler
  const toggleNested = () => {
    setNestedModal(!nestedModal);
  }

  //Handle action after user register a company
  const toggleAndRefresh = async () => {
    setNestedModal(!nestedModal);
    setIsLoading(true);
    try {
      await dispatch(userActions.fetchUserProfile()).then(setIsLoading(false));
    } catch (err) {
      setMessage(err);
      setIsLoading(false);
    }
  }

  //Render if looged user is Company owner and not registered any company
  if (!isLoading && profile != null) {
    if (!profile.registered && profile.role === "co") {
      content = (
        <Modal isOpen={!profile.registered} backdrop="static">
          <ModalHeader toggle={() => { }}>First login?</ModalHeader>
          <ModalBody>
            You haven't registered any company, please register your company before starting. ^_^
           <br />
            {message}
            <br />
            <Button color="info" onClick={toggleNested}>Register now</Button>
            <Modal isOpen={nestedModal} toggle={toggleNested}>
              <ModalHeader>Company registration</ModalHeader>
              <ModalBody>
                <RegCompany onSuccess={() => { dispatch(toggleAndRefresh) }} />
              </ModalBody>
            </Modal>
          </ModalBody>
          <ModalFooter>
            <Button color="warning" onClick={logoutHandler}>LOG OUT</Button>
          </ModalFooter>
        </Modal>)
    }
  }

  //Redirect after logout action is dispatched
  if (redirect) {
    return (
      <Redirect to="/" />
    )
  }

  return (
    <main className="cr-app bg-light">
      <Sidebar />
      <Content fluid onClick={handleContentClick}>
        <Header onLogout={logoutHandler}/>
        {content}
        <Footer />
      </Content>
      <NotificationSystem
        dismissible={false}
        ref={notificationSystemRef}
        style={NOTIFICATION_SYSTEM_STYLE}
      />
    </main>
  );
}


export default MainLayout;
