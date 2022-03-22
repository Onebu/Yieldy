import React, { useState, useEffect } from 'react';
import PropTypes from 'utils/propTypes';
import classNames from 'classnames';
import { CardBody, CardHeader, Row, Col, ListGroupItem, Modal, Table, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import { Empty, Card, Button } from 'antd';


import { PageSpinner } from 'components/BasicElement';
import NoDataImage from '../../assets/img/no-result.svg';
import ManageSysMemberCard from './ManageSysMemberCard';
import Avatar from '../../components/Avatar/Avatar';
import withBadge from '../../hocs/withBadge';
import { UserModal } from '../../components/Info/';


const AvatarWithBadge = withBadge({
    position: 'bottom-right',
    color: 'success',
})(Avatar);


const SystemCard = ({
    children,
    className,
    hide,
    toggleCompany,
    ...restProps
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const classes = classNames(className);
    const system = useSelector(state => state.system.systemInfo);
    const userInfo = useSelector(state => state.user.userProfile);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showUser, setShowUser] = useState(false);
    const [type, setType] = useState(null);
    const [openMemberCard, setOpenMemberCard] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, [])

    const toggleMemberCard = (type, system) => {
        setType(type);
        setOpenMemberCard(!openMemberCard);
    }


    const toggleShowUser = (type, Id) => {
        setUserType(type);
        setUserId(Id);
        setShowUser(!showUser);
    };


    if (isLoading || !!!system || !!!userInfo) {
        return (
            <Card className={classes} {...restProps}>
                <CardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Members</span>
                    </div>
                </CardHeader>
                <CardBody >
                    <PageSpinner />
                </CardBody>
            </Card>
        )
    }

    return (
        <Card className={classes} {...restProps}>
            <Modal centered isOpen={openMemberCard} toggle={() => toggleMemberCard("", null)}>
                <ManageSysMemberCard type={type} system={system} />
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
                        userId={userId} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleShowUser(null, null)}>Cancel</Button>
                </ModalFooter>
            </Modal>

            <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                    <span><big>Members</big></span>
                </div>
            </CardHeader>
            <br />
            <Row>
                <Col lg="12" md="12" sm="12" xs="12">
                    <ListGroupItem className="d-flex">
                        <div className="mx-8 ml-4 mr-auto">Admins</div>
                        {userInfo.role === "co" && !!system.technicians &&
                            <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={() => toggleMemberCard("admins", system)}>
                                Manage
                                    </div>}
                    </ListGroupItem>
                    {system.admins.length < 1 && <ListGroupItem action className="border-light justify-center d-flex" color="info">
                        <Empty
                            className="-auto"
                            image={NoDataImage}
                            imageStyle={{
                                height: 100,
                            }}
                            description={false}
                        >
                            {userInfo.role === "co" && <Button color="link" onClick={() => toggleMemberCard("admins", system)} >Assign Now</Button>}

                        </Empty>
                    </ListGroupItem>}
                    {system.admins.length > 0 &&
                        <Table responsive hover>
                            <tbody>
                                {system.admins.map((admin) => {
                                    return (
                                        <tr
                                            className="cursor-pointer"
                                            key={admin._id}
                                            style={{ backgroundColor: admin.confirmed ? "#eee" : "#cc2" }}
                                            onClick={() => toggleShowUser("admins", admin._id)}>
                                            <td className="align-middle text-center">
                                                <AvatarWithBadge src={!!admin.profileImage ? admin.profileImage.cloudImage : undefined} />
                                            </td>
                                            <td className="align-middle text-center">{!admin.name ? admin.username : admin.name}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>}
                    <ListGroupItem className="d-flex">
                        <div className="mx-8 ml-4 mr-auto">Technicians</div>
                        {userInfo.role === "co" && !!system.technicians &&
                            <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={() => toggleMemberCard("technicians", system)}>
                                Manage
                                    </div>}
                    </ListGroupItem>
                    {system.technicians.length < 1 && <ListGroupItem action className="border-light justify-center d-flex" color="info">
                        <Empty
                            className="-auto"
                            image={NoDataImage}
                            imageStyle={{
                                height: 100,
                            }}
                            description={false}
                        >
                            {userInfo.role === "co" && <Button color="link" onClick={() => toggleMemberCard("technicians", system)} >Assign Now</Button>}
                        </Empty>
                    </ListGroupItem>}
                    {system.technicians.length > 0 &&
                        <Table responsive hover>
                            <tbody>
                                {system.technicians.map((techn) => {
                                    return (
                                        <tr
                                            className="cursor-pointer"
                                            key={techn._id}
                                            style={{ backgroundColor: techn.confirmed ? "#eee" : "#cc2" }}
                                            onClick={() => toggleShowUser("technicians", techn._id)}>
                                            <td className="align-middle text-center">
                                                <AvatarWithBadge src={!!techn.profileImage ? techn.profileImage.cloudImage : undefined} />
                                            </td>
                                            <td className="align-middle text-center">{!techn.name ? techn.username : techn.name}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>}
                </Col>
            </Row>
            {children}
        </Card >
    );
};

SystemCard.propTypes = {
    system: PropTypes.object,
    hide: PropTypes.string,
    toggleCompany: PropTypes.func,
    className: PropTypes.string,
};


export default SystemCard;
