import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, Input, Label, Spinner, Container } from 'reactstrap';
import { useDispatch } from 'react-redux';
import {Button} from 'antd';

import * as companyActions from '../../store/actions/company';
import { updateObject, checkValidity } from '../../utils/formUtils';

const UpdateCompany = props => {
    const [companyForm, setCompanyForm] = useState({
        email: {
            value: "",
            validation: {
                required: true,
                isEmail: true
            },
            valid: false,
            touched: false
        },
        website: {
            value: "",
            validation: {
                required: true,
                isWebsite: true
            },
            valid: false,
            touched: false
        },
        address: {
            value: "",
            validation: {
                required: true,
                isAddress: true
            },
            valid: false,
            touched: false
        },
        phone: {
            value: "",
            validation: {
                required: true,
                isPhone: true
            },
            valid: false,
            touched: false
        },
        description: {
            value: "",
            validation: {
                required: true,
                isLetter: true
            },
            valid: false,
            touched: false
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const company = props.company;


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await dispatch(
                //Check first if user clicked the input before update, in order to decide 
                //update the default value or not
                companyActions.updateCompany(
                    company._id,
                    companyForm["email"].touched?companyForm["email"].value:company.email?company.email:"",
                    companyForm["website"].touched?companyForm["website"].value:company.website?company.website:"",
                    companyForm["address"].touched?companyForm["address"].value:company.address?company.address:"",
                    companyForm["phone"].touched?companyForm["phone"].value:company.phone?company.phone:"",
                    companyForm["description"].touched?companyForm["description"].value:company.description?company.description:"",
                )
            );
            props.onSuccess();
        } catch (err) {
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

        let formIsValid = true;
        for (let inputIdentifier in updatedAuthForm) {
            formIsValid = updatedAuthForm[inputIdentifier].valid && formIsValid;
        }
        setCompanyForm(updatedAuthForm);
    }
    const {
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
            <FormGroup>
                <Label for={emailLabel}>{emailLabel}</Label>
                <Input {...emailInputProps}
                    defaultValue={!!company.email ? company.email :""}
                    innerRef={companyForm["email"].value}
                    onChange={event => handleChange(event, "email")}
                    style={{ borderColor: (!companyForm["email"].valid) && companyForm["email"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={websiteLabel}>{websiteLabel}</Label>
                <Input {...websiteInputProps}
                    defaultValue={!!company.website ? company.website : ""}
                    innerRef={companyForm["website"].value}
                    onChange={event => handleChange(event, "website")}
                    style={{ borderColor: (!companyForm["website"].valid) && companyForm["website"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={addressLabel}>{addressLabel}</Label>
                <Input {...addressInputProps}
                    defaultValue={!!company.address ? company.address : ""}
                    innerRef={companyForm["address"].value}
                    onChange={event => handleChange(event, "address")}
                    style={{ borderColor: (!companyForm["address"].valid) && companyForm["address"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={phoneLabel}>{phoneLabel}</Label>
                <Input {...phoneInputProps}
                    defaultValue={!!company.phone ? company.phone : ""}
                    innerRef={companyForm["phone"].value}
                    onChange={event => handleChange(event, "phone")}
                    style={{ borderColor: (!companyForm["phone"].valid) && companyForm["phone"].touched ? "red" : null }}
                />
            </FormGroup>
            <FormGroup>
                <Label for={descriptionLabel}>{descriptionLabel}</Label>
                <Input {...descriptionInputProps}
                    defaultValue={!!company.description ? company.description : ""}
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
                            block
                            onClick={handleSubmit}>
                            Update
            </Button>
                    </div>)}
            {children}
        </Form>
    );
}


UpdateCompany.propTypes = {
    emailLabel: PropTypes.string,
    emailInputProps: PropTypes.object,
    websiteLabel: PropTypes.string,
    websiteInputProps: PropTypes.object,
    addressLabel: PropTypes.string,
    addressInputProps: PropTypes.object,
    phoneLabel: PropTypes.string,
    phoneInputProps: PropTypes.object,
    descriptionLabel: PropTypes.string,
    descriptionInputProps: PropTypes.object,
};

UpdateCompany.defaultProps = {
    emailLabel: 'Company Email',
    emailInputProps: {
        name: 'email',
        type: 'email',
        placeholder: 'new Email',
    },
    websiteLabel: 'Website',
    websiteInputProps: {
        name: 'website',
        type: 'website',
        placeholder: 'Company website'
    },
    addressLabel: 'Address',
    addressInputProps: {
        name: 'address',
        type: 'address',
        placeholder: 'Company Address'
    },
    phoneLabel: 'Contact phone',
    phoneInputProps: {
        name: 'phone',
        type: 'phone',
        placeholder: 'Contact phone'
    },
    descriptionLabel: 'Company Description',
    descriptionInputProps: {
        name: 'description',
        type: 'textarea',
        placeholder: 'Company Description',
        maxLength:200
    }
};

export default UpdateCompany;