import logo200Image from 'assets/img/logo/logo_200.png';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Form, FormGroup, Input, Label, Spinner, Container, UncontrolledAlert, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';

import * as authAction from '../../store/actions/auth';
import { updateObject, checkValidity } from '../../utils/formUtils';

const AuthFormUser = props => {
  const [authForm, setAuthForm] = useState({
    username: {
      value: '',
      validation: {
        required: true,
        isUsername: true
      },
      valid: false,
      touched: false
    },
    password: {
      value: '',
      validation: {
        required: true,
        isPassword: true,
        minLength: 8
      },
      valid: false,
      touched: false
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formIsValid, setFormIsValid] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(
        authAction.login(
          authForm["username"].value,
          authForm["password"].value,
          "user"
        )
      );
      //setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(authForm[inputIdentifier], {
      value: event.target.value,
      valid: checkValidity(event.target.value, authForm[inputIdentifier].validation),
      touched: true
    });
    const updatedAuthForm = updateObject(authForm, {
      [inputIdentifier]: updatedFormElement
    });

    let formIsValid = true;
    for (let inputIdentifier in updatedAuthForm) {
      formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid;
    }
    setAuthForm(updatedAuthForm);
    setFormIsValid(formIsValid);
  }

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(
        authAction.resend(
          authForm["username"].value,
          "user"
        )
      );
      setMessage('A verification email has been sent');
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  const {
    showLogo,
    usernameLabel,
    usernameInputProps,
    passwordLabel,
    passwordInputProps,
    children,
    onLogoClick,
  } = props;

  return (
    <Form onSubmit={handleSubmit}>
      {showLogo && (
        <div className="text-center pb-4">
          <img
            src={logo200Image}
            className="rounded"
            style={{ width: 60, height: 60, cursor: 'pointer' }}
            alt="logo"
            onClick={onLogoClick}
          />
        </div>
      )}
      <div className="text-center" style={{ color: "#77e" }}  >Login as User</div>
      <hr />
      <FormGroup>
        <Label for={usernameLabel}>{usernameLabel}</Label>
        <Input {...usernameInputProps}
          innerRef={authForm["username"].value}
          onChange={event => handleChange(event, "username")}
          style={{ borderColor: (!authForm["username"].valid) && authForm["username"].touched ? "red" : null }}
        />
      </FormGroup>
      <FormGroup>
        <Label for={passwordLabel}>{passwordLabel}</Label>
        <Input {...passwordInputProps}
          innerRef={authForm["password"].value}
          onChange={event => handleChange(event, "password")}
          style={{ borderColor: (!authForm["password"].valid) && authForm["password"].touched ? "red" : null }}
        />
      </FormGroup>
      <hr />
      {isLoading ? (
        <Container style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner type="grow" color="primary" />
        </Container>) : (
          <div>
            <Button
              size="lg"
              color="primary"
              disabled={!formIsValid}
              block
              onClick={handleSubmit}>
              Login
            </Button>
          </div>)}
      {error && <UncontrolledAlert color="warning" toggle={() => { setError(null) }}>
        {error === "NOT_VERIFIED" ? (
          <div>
            Not verified yet <Button onClick={handleResend}>Resend Email?</Button>
          </div>) : (error)} </UncontrolledAlert>}
      <Modal isOpen={!!message}>
        <ModalBody>
          {message}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => { setMessage(''); }}>Close</Button>
        </ModalFooter>
      </Modal>
      {children}
    </Form>
  );
}


AuthFormUser.propTypes = {
  showLogo: PropTypes.bool,
  usernameLabel: PropTypes.string,
  usernameInputProps: PropTypes.object,
  passwordLabel: PropTypes.string,
  passwordInputProps: PropTypes.object,
  onLogoClick: PropTypes.func,
};

AuthFormUser.defaultProps = {
  authState: 'LOGIN',
  showLogo: true,
  usernameLabel: 'Username',
  usernameInputProps: {
    name: 'username',
    type: 'username',
    placeholder: 'your username',
  },
  passwordLabel: 'Password',
  passwordInputProps: {
    name: 'password',
    type: 'password',
    placeholder:  '8 char 1 uppercase, 1 lowercase, 1 number at least ',
  },
  onLogoClick: () => { },
};

export default AuthFormUser;