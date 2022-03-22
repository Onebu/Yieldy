import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {  Form, FormGroup, Input, Label, Spinner, Container} from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';

import * as userActions from '../../store/actions/user';
import { updateObject, checkValidity } from '../../utils/formUtils';

const UpdateUsername = props => {
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const dispatch = useDispatch();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(
        userActions.updateUsername(
          authForm["username"].value,
          props.type
        )
      );
      props.onSuccess();
    } catch (err) {
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
  const {
    usernameLabel,
    usernameInputProps,
    children,
  } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for={usernameLabel}>{usernameLabel}</Label>
        <Input {...usernameInputProps}
          innerRef={authForm["username"].value}
          onChange={event => handleChange(event, "username")}
          style={{ borderColor: (!authForm["username"].valid) && authForm["username"].touched ? "red" : null }}
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
              Update
            </Button>
          </div>)}
      {children}
    </Form>
  );
}


UpdateUsername.propTypes = {
  usernameLabel: PropTypes.string,
  usernameInputProps: PropTypes.object,
};

UpdateUsername.defaultProps = {
  usernameLabel: 'Username',
  usernameInputProps: {
    name: 'username',
    type: 'username',
    placeholder: 'your username',
  },
};

export default UpdateUsername;