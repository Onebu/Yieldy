import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Input, Spinner, Container } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';

import * as systemActions from '../../store/actions/system';
import { updateObject, checkValidity } from '../../utils/formUtils';

const CreateSystem = props => {
  const [userForm, setUserForm] = useState({
    name: {
      value: '',
      validation: {
        required: true,
        isName: true
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
        systemActions.createSystem(
          userForm["name"].value,
        )
      ).then(props.onSuccess())
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
    nameLabel,
    nameInputProps,
    children,
  } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <legend>{nameLabel}</legend>
        <Input {...nameInputProps}
          innerRef={userForm["name"].value}
          onChange={event => handleChange(event, "name")}
          style={{ borderColor: (!userForm["name"].valid) && userForm["name"].touched ? "red" : null }}
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
              Create
            </Button>
          </div>)}
      {children}
    </Form>
  );
}


CreateSystem.propTypes = {
  nameLabel: PropTypes.string,
  nameInputProps: PropTypes.object,
};

CreateSystem.defaultProps = {
  nameLabel: 'System Name',
  nameInputProps: {
    name: 'email',
    type: 'email',
    placeholder: 'System name',
  },
};

export default CreateSystem;