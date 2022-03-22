import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Form, FormGroup, Input, Label, Spinner, Container, UncontrolledAlert } from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';
import * as companyAction from '../../store/actions/company';
import { updateObject, checkValidity } from '../../utils/formUtils';

const RegCompany = props => {

    const [companyForm, setCompanyForm] = useState({
        name: {
            value: '',
            validation: {
                required: true,
                isName: true,
                minLength: 6
            },
            valid: false,
            touched: false
        },
        email: {
            value: '',
            validation: {
                required: true,
                isEmail: true
            },
            valid: false,
            touched: false
        },
        address: {
            value: '',
            validation: {
                isAddress: true
            },
            valid: false,
            touched: false
        },
        website: {
            value: '',
            validation: {
                isWebsite: true
            },
            valid: false,
            touched: false
        },
        phone: {
            value: '',
            validation: {
                isNumber: true
            },
            valid: false,
            touched: false
        },
        description: {
            valie: '',
            validation: {
            },
            valid: false,
            touched: false
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formIsValid, setFormIsValid] = useState(false);
    const dispatch = useDispatch();


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                companyAction.createCompany(
                    companyForm["name"].value,
                    companyForm["email"].value,
                    companyForm["website"].value,
                    companyForm["address"].value,
                    companyForm["phone"].value,
                    companyForm["description"].value,
                )
            );
            props.onSuccess();
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleChange = (event, inputIdentifier) => {
        const updatedFormElement = updateObject(companyForm[inputIdentifier], {
            value: event.target.value,
            valid: checkValidity(event.target.value, companyForm[inputIdentifier].validation),
            touched: true
        });
        const updatedAuthForm = updateObject(companyForm, {
            [inputIdentifier]: updatedFormElement
        });

        let isValid = updatedAuthForm["name"].valid;
        setCompanyForm(updatedAuthForm);
        setFormIsValid(isValid);
    }

    const {
        nameLabel,
        nameInputProps,
        emailLabel,
        emailInputProps,
        websiteLabel,
        websiteInputProps,
        addressLabel,
        addressInputProps,
        phoneLabel,
        phoneInputProps,
        descriptionLabel,
        descriptionInputProps,
        children,
    } = props;

    return (
        <Form onSubmit={handleSubmit}>
            <hr />
            <FormGroup>
                <Label for={nameLabel}>{nameLabel}</Label>
                <Input {...nameInputProps}
                    innerRef={companyForm["name"].value}
                    onChange={event => handleChange(event, "name")}
                    style={{ borderColor: (!companyForm["name"].valid) && companyForm["name"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={emailLabel}>{emailLabel}</Label>
                <Input {...emailInputProps}
                    innerRef={companyForm["email"].value}
                    onChange={event => handleChange(event, "email")}
                    style={{ borderColor: (!companyForm["email"].valid) && companyForm["email"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={phoneLabel}>{phoneLabel}</Label>
                <Input {...phoneInputProps}
                    innerRef={companyForm["phone"].value}
                    onChange={event => handleChange(event, "phone")}
                    style={{ borderColor: (!companyForm["phone"].valid) && companyForm["phone"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={websiteLabel}>{websiteLabel}</Label>
                <Input {...websiteInputProps}
                    innerRef={companyForm["website"].value}
                    onChange={event => handleChange(event, "website")}
                    style={{ borderColor: (!companyForm["website"].valid) && companyForm["website"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={addressLabel}>{addressLabel}</Label>
                <Input {...addressInputProps}
                    innerRef={companyForm["address"].value}
                    onChange={event => handleChange(event, "address")}
                    style={{ borderColor: (!companyForm["address"].valid) && companyForm["address"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={descriptionLabel}>{descriptionLabel}</Label>
                <Input {...descriptionInputProps}
                    innerRef={companyForm["description"].value}
                    onChange={event => handleChange(event, "description")}
                    style={{ borderColor: (!companyForm["description"].valid) && companyForm["description"].touched ? "red" : null }}
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
            {error && <UncontrolledAlert color="warning" toggle={() => { setError(null) }}>{error} </UncontrolledAlert>}
            {children}
        </Form>
    );
}


RegCompany.propTypes = {
    nameLabel: PropTypes.string,
    nameInputProps: PropTypes.object,
    emailLabel: PropTypes.string,
    emailInputProps: PropTypes.object,
    websiteLabel: PropTypes.string,
    websiteInputProps: PropTypes.object,
    addressLabel: PropTypes.string,
    addressInputProps: PropTypes.object,
    phoneLabel: PropTypes.string,
    phoneInputProps: PropTypes.object,
    descriptionLabel: PropTypes.string,
    descriptionInputProps: PropTypes.object
};

RegCompany.defaultProps = {
    nameLabel: 'name',
    nameInputProps: {
        name: 'name',
        type: 'name',
        placeholder: 'Company‘s name',
    },
    emailLabel: 'Contact email(Optional)',
    emailInputProps: {
        name: 'email',
        type: 'email',
        placeholder: 'Contact email',
    },
    websiteLabel: 'Company website(Optional)',
    websiteInputProps: {
        name: 'website',
        type: 'url',
        placeholder: 'Company website',
    },
    addressLabel: 'Company address(Optional)',
    addressInputProps: {
        name: 'address',
        type: 'address',
        placeholder: 'address',
    },
    phoneLabel: 'Contact phone(Optional)',
    phoneInputProps: {
        name: 'phone',
        type: 'tel',
        placeholder: 'Contact phone here',
    },
    descriptionLabel: 'Contact email(Optional)',
    descriptionInputProps: {
        name: 'description',
        type: 'textarea',
        placeholder: 'Company description(50 char. max.)',
    },
};

export default RegCompany;