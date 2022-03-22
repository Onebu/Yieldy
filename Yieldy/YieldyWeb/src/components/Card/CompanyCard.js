import React from 'react';
import PropTypes from 'utils/propTypes';

import classNames from 'classnames';

import { Card, CardHeader, ListGroup, ListGroupItem, CardBody, Button, CardTitle } from 'reactstrap';
import { useHistory } from 'react-router';

const CompanyCard = ({
    company,
    children,
    className,
    hide,
    toggleCompany,
    ...restProps
}) => {
    const classes = classNames('bg-teal-600', className);
    const history = useHistory();

    return (
        <div >
            <Card className={classes} {...restProps}>
                <CardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Company</span>
                        {hide === "true" && <Button outline color="primary" onClick={toggleCompany} >
                            Hide
                        </Button>}
                    </div>
                </CardHeader>
                <CardBody >
                    <ListGroup>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Name:</small>
                            <small>{company.name}</small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">website:</small>
                            <small>{company.website === "" ?
                                <div className="text-muted">Not set</div> :
                                company.website}
                            </small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">address:</small>
                            <small >{company.address === "" ?
                                <div className="text-muted">Not set</div> :
                                company.address}
                            </small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">email:</small>
                            <small>
                                <small>{company.email === "" ?
                                    <div className="text-muted">Not set</div> :
                                    company.email}
                                </small>
                            </small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Contact phone:</small>
                            <small>{company.phone === "" ?
                                <div className="text-muted">Not set</div> :
                                company.phone}
                            </small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Registration Date:</small>
                            <small>{company.registrationdate === "" ?
                                <div className="text-muted">Not set</div> :
                                company.registrationdate}
                            </small>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Description:</small>
                            <small>{!!!company.description ?
                                <div className="text-muted">Not set</div> :
                                company.description}
                            </small>
                        </ListGroupItem>
                    </ListGroup>
                    <br />
                    <CardTitle>
                        Owner
                    </CardTitle>
                    <ListGroup>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Username:</small>
                            <div>{company.owner.username}</div>
                        </ListGroupItem>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Email:</small>
                            <small><small>{company.owner.email}</small></small>
                        </ListGroupItem>
                    </ListGroup>
                    <br />
                    <CardTitle>
                        System
                    </CardTitle>
                    {company.systems.length >= 1 ? (<ListGroup>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="font-semibold mr-auto">Username:</small>
                            <div>{company.owner.username}</div>
                        </ListGroupItem>
                    </ListGroup>) : (<ListGroup>
                        <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                            <small className="">Oops. Owner hasn't create any system</small>
                        </ListGroupItem>
                    </ListGroup>)}
                    <br />
                    <div className="d-flex justify-content-end align-items-center">
                        <Button color="warning" onClick={() => { history.push('/company') }}>
                            More..
                        </Button>
                    </div>
                </CardBody>
                {children}
            </Card>
        </div>
    );
};

CompanyCard.propTypes = {
    company: PropTypes.object,
    hide: PropTypes.string,
    toggleCompany: PropTypes.func,
    className: PropTypes.string,
};


export default CompanyCard;
