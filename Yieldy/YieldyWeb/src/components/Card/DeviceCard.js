import React, { useState } from 'react';
import { CardHeader, Row, Table, ModalBody, ModalFooter, ModalHeader, Modal } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Empty } from 'antd';
import { Card, Button } from 'antd';

import NoDataImage from '../../assets/img/no-result.svg';
import { CreateDevice } from 'components/Form';
import PageSpinner from 'components/BasicElement/PageSpinner';
import { useHistory } from 'react-router';


const DeviceCard = props => {

    const userInfo = useSelector(state => state.user.userProfile);
    const system = useSelector(state => state.system.systemInfo);
    const [isCreate, setIsCreate] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();

    const toggleCreateDevice = () => {
        setIsCreate(!isCreate);
    }

    const tolleAllAndRefresh = () => {
        setIsCreate(false);
    }


    if (!!!userInfo || !!!system) {
        return (<PageSpinner />)
    }

    return (
        <Card color="info">
            <Modal centered isOpen={isCreate} toggle={toggleCreateDevice} >
                <ModalHeader>Connect Device</ModalHeader>
                <ModalBody>
                    <CreateDevice systemId={system._id} onSuccess={() => { dispatch(tolleAllAndRefresh) }} />
                </ModalBody>
                <ModalFooter>
                    <Button color="info" onClick={toggleCreateDevice}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <CardHeader>
                <Row className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Devices</div>
                    {(userInfo.role === "co" || userInfo.role === "admins") && <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={toggleCreateDevice} >
                        Connect
                </div>}
                </Row>
            </CardHeader>
            <Table responsive className="bg-white">
                <thead>
                    <tr>
                        <th><small>Name</small></th>
                        <th ><small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Actions</small></th>
                    </tr>
                </thead>
                <tbody>
                    {system.devices.length < 1 && <tr>
                        <td ></td>
                        <td>
                            <Empty
                                className="-auto"
                                image={NoDataImage}
                                imageStyle={{
                                    height: 100,
                                }}
                                description={false}
                            >
                                {(userInfo.role === "co" || userInfo.role === "admins") && <Button color="link" onClick={toggleCreateDevice} >Connect</Button>}
                            </Empty>
                        </td></tr>}
                    {system.devices.length > 0 && system.devices.map((device) => {
                        return <tr key={device._id}>
                            <td>{device.name}</td>
                            <td >
                                <Button type="link"
                                    onClick={() => { history.push('/device', { device: device._id }) }}
                                >Detail...</Button>
                            </td>
                        </tr>
                    })}
                </tbody>
            </Table>
        </Card>
    )
}

export default DeviceCard;