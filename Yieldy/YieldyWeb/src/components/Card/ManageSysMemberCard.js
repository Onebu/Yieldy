import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CardHeader, CardBody, Table, Row, Col} from 'reactstrap';
import { Empty,Card,Button } from 'antd';

import PageSpinner from '../BasicElement/PageSpinner';
import NoDataImage from '../../assets/img/no-result.svg';
import * as systemActions from '../../store/actions/system';


const ManageSysMemberCard = props => {

    const { type } = props;
    const company = useSelector(state => state.company.companies[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [abledMember, setAbledMember] = useState(null);  //Compare company member's list with systemInfo's member list(filter a list with user that can be assigned)
    const systemInfo = useSelector(state => state.system.systemInfo);
    const dispatch = useDispatch();
    let memberContent = null;
    let abledContent = null;



    useEffect(() => {
        if (!!systemInfo && !!type) {
            if (type === "admins") {
                setAbledMember(company.admins.filter((admin) => {
                    return !systemInfo.admins.find(({ _id }) => admin._id === _id);
                }))
            } else {
                setAbledMember(company.technicians.filter(function (techn) {
                    return !systemInfo.technicians.find(({ _id }) => techn._id === _id);
                }))
            }
        }
        setIsLoading(false);
    }, [company.admins, company.technicians, systemInfo, type])

    const handleAddMember = async (id) => {
        setIsLoading(true);
        if (type === "admins") {
            dispatch(systemActions.assignadmin(systemInfo._id, id)).then(setIsLoading(false));
        } else {
            dispatch(systemActions.assigntechnician(systemInfo._id, id)).then(setIsLoading(false));
        }
    }

    const handleRemoveMember = async (id) => {
        setIsLoading(true);
        if (type === "admins") {
            dispatch(systemActions.revokeadmin(systemInfo._id, id)).then(setIsLoading(false));
        } else {
            dispatch(systemActions.revoketechnician(systemInfo._id, id)).then(setIsLoading(false));
        }
    }

    if (isLoading) {
        return <PageSpinner />
    }

    if (!!systemInfo) {
        if (type === "admins") {
            if (systemInfo.admins.length < 1) {
                memberContent = <tr>
                    <td ></td>
                    <td>
                        <Empty
                            className="-auto"
                            image={NoDataImage}
                            imageStyle={{
                                height: 100,
                            }}
                            description={false}
                        />
                    </td></tr>
            } else {
                memberContent = systemInfo.admins.map((user) => {
                    return <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{!!user.name ? user.name : "Not set"}</td>
                        <td><Button onClick={() => { handleRemoveMember(user._id) }}>Remove</Button></td>
                    </tr>
                })
            }
        } else {
            if (systemInfo.technicians.length < 1) {
                memberContent = <tr>
                    <td ></td>
                    <td>
                        <Empty
                            className="-auto"
                            image={NoDataImage}
                            imageStyle={{
                                height: 100,
                            }}
                            description={false}
                        />
                    </td></tr>
            } else {
                memberContent = systemInfo.technicians.map((user) => {
                    return <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{!!user.name ? user.name : "Not set"}</td>
                        <td><Button onClick={() => { handleRemoveMember(user._id) }}>Remove</Button></td>
                    </tr>
                })
            }
        }

    }

    if (abledMember) {
        abledContent = abledMember.map((user) => {
            return <tr key={user._id}>
                <td>{user.username}</td>
                <td>{!!user.name ? user.name : "Not set"}</td>
                <td><Button onClick={() => { handleAddMember(user._id) }}>Add</Button></td>
            </tr>
        })
    }

    return (
        <Card >
            <CardHeader>
                <div>Managing{' '} {type}</div>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col lg="12" md="12" sm="12" xs="12" className="mb-4">
                        <Card>
                            <CardHeader>System's member</CardHeader>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberContent}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                    <Col lg="12" md="12" sm="12" xs="12">
                        <Card>
                            <CardHeader>Available member</CardHeader>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abledMember.length>0 ? abledContent : (<tr>
                                        <td ></td>
                                        <td>
                                            <Empty
                                                className="-auto"
                                                image={NoDataImage}
                                                imageStyle={{
                                                    height: 100,
                                                }}
                                                description={false}
                                            />
                                        </td></tr>)}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card >
    );
}

export default ManageSysMemberCard;