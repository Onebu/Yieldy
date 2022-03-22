import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    CardBody,
    ListGroup,
    ListGroupItem,
    Collapse,
    Modal,
    ModalBody,
    ModalHeader,
    Col,
    Row,
    CardHeader,
    ButtonGroup,
    ModalFooter,
    Table,
} from 'reactstrap';
import {
    MdUnfoldMore,
    MdUnfoldLess
} from 'react-icons/md';
import { Button, Card, Empty, Popover } from 'antd';
import * as moment from 'moment'

import * as companyActions from '../../store/actions/company';
import * as systemActions from '../../store/actions/system';
import { Page, PageSpinner } from 'components/BasicElement';
import Avatar from '../../components/Avatar/Avatar';
import withBadge from '../../hocs/withBadge';

import { UpdateCompany, CreateSystem, CreateUser } from 'components/Form/';
import NoDataImage from 'assets/img/no-result.svg';
import { UserCard } from 'components/Card';
import { UserModal } from 'components/Info';


const AvatarWithBadge = withBadge({
    position: 'bottom-right',
    color: 'success',
})(Avatar);

const Company = props => {

    const [isLoading, setIsLoading] = useState(false);
    const [showCompany, setShowCompany] = useState(true);
    const [showUser, setShowUser] = useState(false);
    const [updateCompany, setUpdateCompany] = useState(false);
    const [rSelected, setRSelected] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [visible, setVisible] = useState(false);
    const [showCreateSys, setShowCreateSys] = useState(false);
    const [createUser, setCreateUser] = useState(false);
    const company = useSelector(state => state.company.companies[0]);
    const profile = useSelector(state => state.user.userProfile);
    let systemContent = null;
    let adminContent = null;
    let technicianContent = null;
    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoading(true);
        async function fetchCompany() {
            await dispatch(companyActions.fetchCompany())
        }
        fetchCompany().then(setIsLoading(false));
    }, [dispatch])

    useEffect(() => {
        if (!!company && company.systems.length>0) {
            setRSelected(company.systems[0]._id);
        }
    }, [systemContent, company])


    const toggleUpdateCompany = () => setUpdateCompany(!updateCompany);

    const toggleShowUser = (type, Id) => {
        setUserType(type);
        setUserId(Id);
        setShowUser(!showUser);
    };


    const handleVisibleChange = visible => {
        setVisible(visible);
    };

    const toggleAndRefresh = async () => {
        await dispatch(companyActions.fetchCompany());
        setShowUser(false);
        setUserType(null);
        setUserId(null);
        setCreateUser(false);
        setUpdateCompany(false);
    }

    const handleDelete = async () => {
        await dispatch(systemActions.deleteSystem(rSelected)).then(setVisible(false));
    }



    if (isLoading || !!!company || !!!profile) {
        return (
            <PageSpinner />
        )
    }

    if (company.systems.length >= 1) {
        systemContent =
            <Card style={{ overflowX: 'auto', 'paddingBottom': '15px', 'height': 'fit-content', 'paddingTop': 'inherit' }}>
                <ButtonGroup>
                    {company.systems.map((system) => {
                        return <Popover key={system._id} content={"Click to switch system"} title="Hint" trigger="hover">
                            <Button
                                onClick={() => setRSelected(system._id)}
                                type={rSelected === system._id && "primary"}>
                                {system.name}
                            </Button>
                        </Popover>
                    })}
                </ButtonGroup>
                {!!rSelected ? <> {company.systems.filter((system) => {
                    return system._id === rSelected;
                }).map(system => {
                    return (
                        <ListGroup key={system._id}>
                            <ListGroupItem action className="border-light d-flex" >
                                <span className="font-semibold mr-auto col-sm-6">Name:</span>
                                <span className="col-sm-6">{system.name}</span>
                            </ListGroupItem>
                            <ListGroupItem action className="border-light d-flex" >
                                <span className="font-semibold mr-auto col-sm-6">#Admin:</span>
                                <span className="col-sm-6">{system.admins.length}</span>
                            </ListGroupItem>
                            <ListGroupItem action className="border-light d-flex">
                                <span className="font-semibold mr-auto col-sm-6">#Technicians:</span>
                                <span className="col-sm-6">{system.technicians.length}</span>
                            </ListGroupItem>
                            <ListGroupItem action className="border-light d-flex">
                                <span className="font-semibold mr-auto col-sm-6">#Conected Devices:</span>
                                <span className="col-sm-6">{system.devices.length}</span>
                            </ListGroupItem>
                            <ListGroupItem action className="border-light text-right">
                                <Button
                                    onClick={() => props.history.push('/system', { systemId: system._id })}
                                >More detail</Button>{' '}
                                <Popover
                                    content={<Button type="danger" onClick={handleDelete} >^_^Yes</Button>}
                                    title="Are you sure?"
                                    trigger="click"
                                    visible={visible}
                                    onVisibleChange={handleVisibleChange}
                                >
                                    {company.owner._id === profile._id &&
                                        <Button className="align-self-center text-red-500 mr-4 cursor-pointer">
                                            Delete
                                    </Button>}
                                </Popover>
                            </ListGroupItem>
                        </ListGroup>)
                })}</> : null}
            </Card>
    } else {
        systemContent =
            <ListGroupItem action className="border-light justify-center d-flex" color="info">
                <Empty
                    className="-auto"
                    image={NoDataImage}
                    imageStyle={{
                        height: 100,
                    }}
                    description={false}
                />
            </ListGroupItem>;
    }

    if (company.admins.length >= 1) {
        adminContent =
            <Table responsive hover>
                <tbody>
                    {company.admins.map((admin) => {
                        return (
                            <tr
                                className="cursor-pointer"
                                key={admin._id}
                                style={{ backgroundColor: admin.confirmed ? "#eee" : "#cc2" }}
                                onClick={() => toggleShowUser("admins", admin._id)}>
                                <td className="align-middle text-center" >
                                    <AvatarWithBadge src={!!admin.profileImage ? admin.profileImage.cloudImage : undefined} />
                                </td>
                                <td className="align-middle text-center">{!admin.name ? admin.username : admin.name}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
    } else {
        adminContent =
            <ListGroupItem action className="border-light justify-center d-flex" color="info">
                <Empty
                    className="-auto"
                    image={NoDataImage}
                    imageStyle={{
                        height: 100,
                    }}
                    description={false}
                />
            </ListGroupItem>;
    }

    if (company.technicians.length >= 1) {
        technicianContent =
            <Table responsive hover>
                <tbody>
                    {company.technicians.map((techn) => {
                        return (
                            <tr
                                className="cursor-pointer"
                                key={techn._id}
                                style={{ backgroundColor: techn.confirmed ? "#eee" : "#cc2" }}
                                onClick={() => toggleShowUser("technicians", techn._id)}>
                                <td className="align-middle text-center" >
                                    <AvatarWithBadge src={!!techn.profileImage ? techn.profileImage.cloudImage : undefined} />
                                </td>
                                <td className="align-middle text-center">{!techn.name ? techn.username : techn.name}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
    } else {
        technicianContent =
            <ListGroupItem action className="border-light justify-center d-flex" color="info">
                <Empty
                    className="-auto"
                    image={NoDataImage}
                    imageStyle={{
                        height: 100,
                    }}
                    description={false}
                />
            </ListGroupItem>;
    }

    return (
        <Page style={{ margin: 20 }}>
            <div>
                <hr className="hr-text" data-content="Company" />
            </div>
            {/* Modal part */}
            <Modal
                centered
                isOpen={updateCompany}
                toggle={toggleUpdateCompany}
            >
                <ModalHeader>
                    Update Company
                </ModalHeader>
                <ModalBody>
                    <UpdateCompany company={company} onSuccess={() => { dispatch(toggleAndRefresh) }} />
                </ModalBody>
            </Modal>
            <Modal
                centered
                isOpen={showCreateSys}
                toggle={() => setShowCreateSys(false)}
            >
                <ModalHeader>
                    Create System
                </ModalHeader>
                <ModalBody>
                    <CreateSystem onSuccess={() => setShowCreateSys(false)} />
                </ModalBody>
            </Modal>
            <Modal
                centered
                isOpen={createUser}
                toggle={() => setCreateUser(false)}
            >
                <ModalHeader>
                    Create User
                </ModalHeader>
                <ModalBody>
                    <CreateUser onSuccess={toggleAndRefresh} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setCreateUser(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <Modal
                centered
                isOpen={showUser}
                toggle={() => toggleShowUser(null, null)}
            >
                <ModalHeader>
                    User Info
                </ModalHeader>
                <ModalBody>
                    <UserModal
                        type={userType}
                        userId={userId}
                        onSuccess={toggleAndRefresh}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => toggleShowUser(null, null)}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <Row>
                <Col lg="8" md="8" sm="12" xs="12" >
                    <Card className="mb-4" color="info">
                        <CardHeader>
                            <Row className="d-flex">
                                <div className="mx-8 ml-4 mr-auto">Company</div>
                                {company.owner._id === profile._id ?
                                    <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={toggleUpdateCompany}>
                                        Edit
                                    </div> : null}
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <ListGroup>
                                <ListGroupItem action className="border-light d-flex" onClick={() => { setShowCompany(!showCompany) }} color="info">
                                    <div className="mx-8 font-semibold col-md-8 mr-auto">
                                        Detail
                                </div>
                                    <div className="align-self-center text-red-500">
                                        {showCompany ? <MdUnfoldLess /> : <MdUnfoldMore />}
                                    </div>
                                </ListGroupItem>
                            </ListGroup>
                            <Collapse isOpen={showCompany}>
                                <ListGroup>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">Name:</span>
                                        <span className="col-sm-6">{company.name}</span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">website:</span>
                                        <span className="col-sm-6">{company.website === "" ?
                                            <div className="text-muted">Not set</div> :
                                            company.website}
                                        </span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">address:</span>
                                        <span className="col-sm-6">{company.address === "" ?
                                            <div className="text-muted">Not set</div> :
                                            company.address}
                                        </span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">email:</span>
                                        <span className="col-sm-6">
                                            <span>{company.email === "" ?
                                                <div className="text-muted">Not set</div> :
                                                company.email}
                                            </span>
                                        </span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex " >
                                        <span className="font-semibold mr-auto col-sm-6">Contact phone:</span>
                                        <span className="col-sm-6">{company.phone === "" ?
                                            <div className="text-muted">Not set</div> :
                                            company.phone}
                                        </span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">Registration Date:</span>
                                        <span className="col-sm-6">{company.registrationdate === "" ?
                                            <div className="text-muted">Not set</div> :
                                            moment(company.registrationdate).format('YYYY-MM-DD')}
                                        </span>
                                    </ListGroupItem>
                                    <ListGroupItem action className="border-light d-flex" >
                                        <span className="font-semibold mr-auto col-sm-6">Description:</span>
                                        <span className="col-sm-6">{!!!company.description ?
                                            <div className="text-muted">Not set</div> :
                                            company.description}
                                        </span>
                                    </ListGroupItem>
                                </ListGroup>
                            </Collapse>
                        </CardBody>
                    </Card>
                    <Card color="info">
                        <CardHeader>
                            <Row className="d-flex">
                                <div className="mx-8 ml-4 mr-auto">Systems</div>
                                {company.owner._id === profile._id ?
                                    <div
                                        className="align-self-center text-red-500 mr-4 cursor-pointer"
                                        onClick={() => { setShowCreateSys(true) }}
                                    >
                                        Create
                                    </div> : null}
                            </Row>
                        </CardHeader>
                        <CardBody>
                            {systemContent}
                        </CardBody>
                    </Card>
                </Col>
                <Col lg="4" md="4" sm="12" xs="12" >
                    <Card className="mb-4">
                        <CardHeader>
                            Owner
                        </CardHeader>
                        <UserCard
                            avatar={!!company.owner.profileImage ? company.owner.profileImage.cloudImage : undefined}
                            title={company.owner.username}
                            subtitle={"Own " + company.owner.company.length + " companies"}
                            text={company.owner.email}
                            style={{
                                height: 300,
                            }}
                        >
                            <Button
                                color='light'
                                onClick={() => toggleShowUser(company.owner.role, company.owner._id)}
                            > Detail</Button>
                        </UserCard>

                    </Card>
                    <Card color="info">
                        <CardHeader className="mb-3">
                            <Row className="d-flex">
                                <div className="mx-8 ml-4 mr-auto">Members</div>
                                {company.owner._id === profile._id ?
                                    <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={() => setCreateUser(true)}>
                                        Add User
                                    </div> : null}
                            </Row>
                        </CardHeader>
                        <ListGroupItem>
                            Admin
                        </ListGroupItem>
                        {adminContent}
                        <ListGroupItem>
                            Technician
                            </ListGroupItem>
                        {technicianContent}
                    </Card>
                </Col>
            </Row>
        </Page>
    )
}

export default Company;