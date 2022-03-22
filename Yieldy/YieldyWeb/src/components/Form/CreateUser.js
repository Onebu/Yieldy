import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {  Form, FormGroup, Input, Label, Spinner, Container } from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';

import * as userActions from '../../store/actions/user';
import { updateObject, checkValidity } from '../../utils/formUtils';

const CreateUser = props => {
  const [userForm, setUserForm] = useState({
    email: {
      value: '',
      validation: {
        required: true,
        isEmail: true
      },
      valid: false,
      touched: false
    },
    role: {
      value: "",
      validation: {
        required: true
      },
      valid: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const dispatch = useDispatch();



  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(
        userActions.createUser(
          userForm["role"].value,
          userForm["email"].value
        )
      );
      props.onSuccess();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleChange = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(userForm[inputIdentifier], {
      value: event.target.value,
      valid: checkValidity(event.target.value, userForm[inputIdentifier].validation),
      touched: true
    });
    const updatedAuthForm = updateObject(userForm, {
      [inputIdentifier]: updatedFormElement
    });

    let formIsValid = true;
    for (let inputIdentifier in updatedAuthForm) {
      formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid;
    }
    setUserForm(updatedAuthForm);
    setFormIsValid(formIsValid);
  }

  const {
    emailLabel,
    emailInputProps,
    roleLabel,
    roleInputProps,
    children,
  } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <legend>{emailLabel}</legend>
        <Input {...emailInputProps}
          innerRef={userForm["email"].value}
          onChange={event => handleChange(event, "email")}
          style={{ borderColor: (!userForm["email"].valid) && userForm["email"].touched ? "red" : null }}
        />
      </FormGroup>
      <hr />
      <FormGroup tag="fieldset">
        <legend>User type</legend>
        <FormGroup check>
          <Label check>
            <Input {...roleInputProps} value="admin" onChange={event => handleChange(event, "role")}/>{' '}
            Admin
          </Label>
        </FormGroup>
        <FormGroup check>
          <Label for={roleLabel}>
            <Input {...roleInputProps} value="technician" onChange={event => handleChange(event, "role")} />{' '}
            Technician
          </Label>
        </FormGroup>
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
              Create
            </Button>
          </div>)}
      {children}
    </Form>
  );
}


CreateUser.propTypes = {
  emailLabel: PropTypes.string,
  emailInputPropsxxxxxx: PropTypes.object,
};

CreateUser.defaultProps = {
  emailLabel: 'User email',
  emailInputProps: {
    name: 'email',
    type: 'email',
    placeholder: 'User email',
  },
  roleLabel: 'Role',
  roleInputProps: {
    name: "role",
    type: "radio",
    placeholder: "User role"
  }
};

export default CreateUser;