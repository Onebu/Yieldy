import logo200Image from 'assets/img/logo/logo_200.png';
import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import {  Form, FormGroup, Input, Label, Spinner, Container, UncontrolledAlert, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';

import * as authAction from '../../store/actions/auth';
import { updateObject, checkValidity } from '../../utils/formUtils';

const AuthFormCo = props => {
  const [authForm, setAuthForm] = useState({
    email: {
      value: '',
      validation: {
        required: true,
        isEmail: true
      },
      valid: false,
      touched: false
    },
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
    confirmPassword: {
      value: '',
      validation: {
        required: true,
        isPassword: true,
        matchCheck: true,
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

  const isLogin = useCallback(() => {
    return props.authState === STATE_LOGIN;
  }, [props.authState])

  const isSignup = useCallback(() => {
    return props.authState === STATE_SIGNUP;
  }, [props.authState])

  const changeAuthState = authState => event => {
    event.preventDefault();
    props.onChangeAuthState(authState);
  };

  const toggleMessageModal = () => {
    setMessage('');
    props.onChangeAuthState(STATE_LOGIN);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    if (isSignup()) {
      try {
        await dispatch(
          authAction.signup(
            authForm["username"].value,
            authForm["email"].value,
            authForm["password"].value,
          )
        );
        setMessage('A verification email has been sent to '
          + authForm["email"].value + '.');
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    } else {
      try {
        await dispatch(
          authAction.login(
            authForm["email"].value,
            authForm["password"].value,
            "co"
          )
        );
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(
        authAction.resend(
          authForm["email"].value,
          "co"
        )
      );
      setMessage('A verification email has been sent to '
        + authForm["email"].value + '.');
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

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
    if (isLogin()) {
      formIsValid = (updatedAuthForm["email"].valid && updatedAuthForm["password"].valid) ||
        (updatedAuthForm["username"].valid && updatedAuthForm["password"].valid);
    } else {
      for (let inputIdentifier in updatedAuthForm) {
        formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid;
      }
      formIsValid = formIsValid && (updatedAuthForm["confirmPassword"].value === updatedAuthForm["password"].value);
    }
    setAuthForm(updatedAuthForm);
    setFormIsValid(formIsValid);
  }


  const renderButtonText = () => {
    const { buttonText } = props;

    if (!buttonText && isLogin()) {
      return 'Login';
    }

    if (!buttonText && isSignup()) {
      return 'Signup';
    }

    return buttonText;
  }

  const {
    showLogo,
    usernameLabel,
    usernameInputProps,
    emailLabel,
    emailInputProps,
    passwordLabel,
    passwordInputProps,
    confirmPasswordLabel,
    confirmPasswordInputProps,
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
      {!isSignup() ? (
        <div className="text-center" style={{ color: "#77e" }}  >Login as Company Owner</div>) : (
          <div className="text-center" style={{ color: "#77e" }}  >Register as Company Owner</div>
        )}
      <hr />
      {isSignup() && (
        <FormGroup>
          <Label for={usernameLabel}>{usernameLabel}</Label>
          <Input {...usernameInputProps}
            innerRef={authForm["username"].value}
            onChange={event => handleChange(event, "username")}
            style={{ borderColor: (!authForm["username"].valid) && authForm["username"].touched ? "red" : null }}
          />
        </FormGroup>)}
      <FormGroup>
        <Label for={emailLabel}>{emailLabel}</Label>
        <Input {...emailInputProps}
          innerRef={authForm["email"].value}
          onChange={event => handleChange(event, "email")}
          style={{ borderColor: (!authForm["email"].valid) && authForm["email"].touched ? "red" : null }}
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
      {isSignup() && (
        <FormGroup>
          <Label for={confirmPasswordLabel}>{confirmPasswordLabel}</Label>
          <Input {...confirmPasswordInputProps}
            innerRef={authForm["confirmPassword"].value}
            onChange={event => handleChange(event, "confirmPassword")}
            style={{ borderColor: (!authForm["confirmPassword"].valid) && authForm["confirmPassword"].touched ? "red" : null }}
          />
        </FormGroup>
      )}
      <hr />
      {isLoading ? (
        <Container style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner type="grow" color="primary" />
        </Container>) : (
          <div>
            <Button
              size="lg"
              color="primary"
              block
              disabled={!formIsValid}
              onClick={handleSubmit}>
              {renderButtonText()}
            </Button>

            <div className="text-center pt-1">
              <h6>
                {isSignup() ? (
                  <a href="#login" onClick={changeAuthState(STATE_LOGIN)}>
                    Login
                  </a>
                ) : (
                    <a href="#signup" onClick={changeAuthState(STATE_SIGNUP)}>
                      Signup
                    </a>
                  )}
              </h6>
            </div></div>)}
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
          <Button color="primary" onClick={toggleMessageModal}>Close</Button>
        </ModalFooter>
      </Modal>
      {children}
    </Form>
  );
}

export const STATE_LOGIN = 'LOGIN';
export const STATE_SIGNUP = 'SIGNUP';

AuthFormCo.propTypes = {
  authState: PropTypes.oneOf([STATE_LOGIN, STATE_SIGNUP]).isRequired,
  showLogo: PropTypes.bool,
  usernameLabel: PropTypes.string,
  usernameInputProps: PropTypes.object,
  emailLabel: PropTypes.string,
  emailInputProps: PropTypes.object,
  passwordLabel: PropTypes.string,
  passwordInputProps: PropTypes.object,
  confirmPasswordLabel: PropTypes.string,
  confirmPasswordInputProps: PropTypes.object,
  onLogoClick: PropTypes.func,
};

AuthFormCo.defaultProps = {
  authState: 'LOGIN',
  showLogo: true,
  usernameLabel: 'Username',
  usernameInputProps: {
    name: 'username',
    type: 'username',
    placeholder: 'your username',
  },
  emailLabel: 'Email',
  emailInputProps: {
    name: 'email',
    type: 'email',
    placeholder: 'your@email.com',
  },
  passwordLabel: 'Password',
  passwordInputProps: {
    name: 'password',
    type: 'password',
    placeholder: '8 char 1 uppercase, 1 lowercase, 1 number at least ',
  },
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordInputProps: {
    name: 'confirmPassword',
    type: 'password',
    placeholder: 'confirm your password',
  },
  onLogoClick: () => { },
};

export default AuthFormCo;