import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Input, Label, Spinner, Container } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag } from 'antd';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import * as taskActions from '../../store/actions/task';
import { updateObject, checkValidity } from '../../utils/formUtils';

const CreateTask = props => {
  const [taskForm, setTaskForm] = useState({
    content: {
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
  const userInfo = useSelector(state => state.user.userProfile);
  const [startDate, setStartDate] = useState(new Date());
  const [isDateValid, setIsDateValid] = useState(true);
  const dispatch = useDispatch();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(
        taskActions.createtask(
          taskForm["content"].value,
          startDate,
          props.systemId,
          userInfo._id
        )
      );
      props.onSuccess();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const datePick = (date) => {
    setIsDateValid(new Date(date) !== "Invalid Date" && date > new Date());
    if (new Date(date) !== "Invalid Date" && date > new Date()) {
      setStartDate(date);
    }
  }

  const handleChange = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(taskForm[inputIdentifier], {
      value: event.target.value,
      valid: checkValidity(event.target.value, taskForm[inputIdentifier].validation),
      touched: true
    });
    const updatedAuthForm = updateObject(taskForm, {
      [inputIdentifier]: updatedFormElement
    });

    let formIsValid = true;
    for (let inputIdentifier in updatedAuthForm) {
      formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid && isDateValid;
    }
    setTaskForm(updatedAuthForm);
    setFormIsValid(formIsValid);
  }
  const {
    contentLabel,
    contentInputProps,
    children,
  } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label > Deadline</Label>
        <br />
        <DatePicker
          selected={startDate}
          onChange={date => datePick(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        {!isDateValid && <Tag color="gold">{' '} Please select a valid date</Tag>}
      </FormGroup>
      <FormGroup>
        <Label for={contentLabel}>{contentLabel}</Label>
        <Input {...contentInputProps}
          innerRef={taskForm["content"].value}
          onChange={event => handleChange(event, "content")}
          style={{ borderColor: (!taskForm["content"].valid) && taskForm["content"].touched ? "red" : null }}
        />
      </FormGroup>
      <hr />
      {
        isLoading ? (
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
            </div>)
      }
      {children}
    </Form >
  );
}


CreateTask.propTypes = {
  contentLabel: PropTypes.string,
  contentInputProps: PropTypes.object,
};

CreateTask.defaultProps = {
  contentLabel: 'Content',
  contentInputProps: {
    content: 'content',
    type: 'textarea',
    placeholder: 'task content',
  },
};

export default CreateTask;