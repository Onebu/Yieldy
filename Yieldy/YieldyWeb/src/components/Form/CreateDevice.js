import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {  Form, FormGroup, Input, Label, Spinner, Container} from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';

import * as deviceActions from '../../store/actions/device';
import { updateObject, checkValidity } from '../../utils/formUtils';

const CreateDevice = props => {
  const [deviceForm, setDeviceForm] = useState({
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
        deviceActions.createdevice(
          deviceForm["name"].value,
          props.systemId
        )
      );
      props.onSuccess();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleChange = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(deviceForm[inputIdentifier], {
      value: event.target.value,
      valid: checkValidity(event.target.value, deviceForm[inputIdentifier].validation),
      touched: true
    });
    const updatedAuthForm = updateObject(deviceForm, {
      [inputIdentifier]: updatedFormElement
    });

    let formIsValid = true;
    for (let inputIdentifier in updatedAuthForm) {
      formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid;
    }
    setDeviceForm(updatedAuthForm);
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
        <Label for={nameLabel}>{nameLabel}</Label>
        <Input {...nameInputProps}
          innerRef={deviceForm["name"].value}
          onChange={event => handleChange(event, "name")}
          style={{ borderColor: (!deviceForm["name"].valid) && deviceForm["name"].touched ? "red" : null }}
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


CreateDevice.propTypes = {
  nameLabel: PropTypes.string,
  nameInputProps: PropTypes.object,
};

CreateDevice.defaultProps = {
  nameLabel: 'Name',
  nameInputProps: {
    name: 'name',
    type: 'name',
    placeholder: 'device name',
  },
};

export default CreateDevice;