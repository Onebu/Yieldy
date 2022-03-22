import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import { FormGroup, Label, Input, FormText, Form } from 'reactstrap';
import {Button} from 'antd';

import * as userActions from '../../store/actions/user';
import { PageSpinner } from 'components/BasicElement';

const EditImage = props => {

    const [imageForm, setImageForm] = useState({
        imageName: null,
        image: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setImageForm({ imageName: e.target.files[0].name, image: e.target.files[0] });
        let isValid = e.target.files[0] != null && e.target.files[0].name != null;
        setValid(isValid);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await dispatch(
                userActions.editImage(
                    imageForm["imageName"],
                    imageForm["image"],
                    props.type
                )
            );
            props.onSuccess();
        }catch(err) {
            setIsLoading(false);
        }
    }

    if(isLoading) {
        return (
            <PageSpinner />
        )
    }
    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="image">Image</Label>
                <Input type="file" name="image" accept="image/*" onChange={handleChange} />
                <FormText color="muted">
                    Upload your image now
        </FormText>
            </FormGroup>
            <Button
                disabled={!valid}
                onClick={handleSubmit}
            >Upload</Button>
        </Form>
    )
}

export default EditImage;