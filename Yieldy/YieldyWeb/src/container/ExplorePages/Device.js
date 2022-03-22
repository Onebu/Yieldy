import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer, Result, Tabs } from 'antd';
import Fab from '@material-ui/core/Fab';
import { MdMessage } from 'react-icons/md';
import { Row, Col } from 'reactstrap';

import { useWindowDimensions } from '../../utils/dimension';
import * as deviceActions from '../../store/actions/device';
import * as companyActions from '../../store/actions/company';
import { PageSpinner, Page } from 'components/BasicElement';
import { MessageCard, MetricPane, DeviceOptionCard, AuditPane } from 'components/Card';

const FabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
};

const { TabPane } = Tabs;

const Device = props => {

    const { width } = useWindowDimensions();
    const [collapse, setCollapse] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const deviceInfo = useSelector(state => state.device.fetchedDevice);
    const company = useSelector(state => state.company.companies[0]);
    const userInfo = useSelector(state => state.user.userProfile);
    const statusInfo = useSelector(state => state.device.fetchedStatus);
    const [rSelected, setRSelected] = useState(!!deviceInfo ? deviceInfo.system._id : null);
    const [rSelDevice, setRSelDivice] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [redirected, setRedirected] = useState(false);
    const [current, setCurrent] = useState('1');
    const dispatch = useDispatch();
    let systemBtnContent = null;



    useEffect(() => {
        setIsLoading(true);
        if (!!props.location.state && !!props.location.state.device && !!!rSelDevice) {
            setDeviceId(props.location.state.device);
            setRedirected(true);
        } else {
            setRedirected(false);
        }
        async function fetchDeivce() {
            await dispatch(deviceActions.fetchdevicebyid(deviceId));
        }
        async function fetchCompany() {
            await dispatch(companyActions.fetchCompany())
        }
        if (!!deviceId) {
            fetchDeivce()
                .then(fetchCompany())
                .then(setIsLoading(false));
        } else {
            fetchCompany().then(setIsLoading(false));
        }
    }, [dispatch, deviceId, props.location.state, rSelDevice])

    useEffect(() => {
        async function fetchStatus() {
            await dispatch(deviceActions.fetchStatus(deviceInfo.statusCode));
            await dispatch(deviceActions.fetchMetricByDevice(deviceInfo.statusCode));
            await dispatch(deviceActions.fetchAuditByDevice(deviceInfo.statusCode));
        }
        if (!!deviceInfo) {
            setRSelected(deviceInfo.system._id);
            setRSelDivice(deviceInfo.name);
            fetchStatus();
        }
        return () => {

        }
    }, [deviceInfo, dispatch])

    const deleteHandler = () => {
        window.location.reload();
    }

    const handleChange = (key) => {
        setRSelected(key);
    }

    const deviceChangeHandler = (key) => {
        setDeviceId(key);
    }

    const handleClick = (key) => {
        console.log(123);
        setCurrent(key);
    }

    if (isLoading || !!!userInfo || !!!company) {
        return <PageSpinner />
    }


    if (!!company) {
        systemBtnContent = company.systems.map(system => {
            return <TabPane tab={system.name} key={system._id} >
                <Tabs defaultActiveKey="1" tabPosition="left" style={{ height: "400" }} onChange={deviceChangeHandler}>
                    <TabPane tab="Select Device" key="1" disabled size="large" />
                    {!!rSelected && company.systems.filter(system => system._id === rSelected)[0].devices.map(device => {
                        return <TabPane
                            key={device._id}
                            tab={device.name}
                        >
                            {device.name}
                        </TabPane>
                    })}
                </Tabs>
            </TabPane>
        })

    }


    if (!!!deviceInfo && !!!rSelected) {
        return <Page style={{ margin: 20 }} >
            <div>
                <hr className="hr-text" data-content="Device" />
            </div>
            <Row>
                <Col xl="12" lg="12" md="12" sm="12" xs="12" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20, marginLeft: 20 }}>
                    <Tabs defaultActiveKey="1" centered onChange={handleChange} type="card">
                        <TabPane tab="Select system" key="1" disabled />
                        {systemBtnContent}
                    </Tabs>
                </Col>
            </Row>
            <Result
                status="404"
                title="!!!!"
                subTitle="Select system and device first "
            />
        </Page >
    }

    return (
        <Page style={{ margin: 20 }} >
            <Drawer
                width={width < 800 ? "70%" : 500}
                title="Comments"
                placement="right"
                closable={false}
                onClose={() => setCollapse(!collapse)}
                visible={!collapse}
            >
                {deviceInfo && <MessageCard style={{ width: 300 }} system={deviceInfo.system._id} />}
            </Drawer>
            <div>
                <hr className="hr-text" data-content="Device" />
            </div>
            <Row >
                <Col xl="12" lg="12" md="12" sm="12" xs="12" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20, marginLeft: 20 }} >
                    <Tabs defaultActiveKey={rSelected} size="large" onChange={handleChange} type="card" >
                        <TabPane tab="Select system" key="1" disabled />
                        {company.systems.map(system => {
                            return <TabPane tab={system.name} key={system._id}>
                                <Tabs defaultActiveKey={!!props.location.state&&!!props.location.state.device ? props.location.state.device : "1"} tabPosition="left" style={{ height: "400" }} onChange={deviceChangeHandler}>
                                    <TabPane tab="Select Device" key="1" disabled size="large" />
                                    {!!rSelected && company.systems.filter(system => system._id === rSelected)[0].devices.map(device => {
                                        return <TabPane
                                            key={device._id}
                                            tab={device.name}
                                        >
                                            <Row className="w-full mr-0 right-0 ">
                                                <Col xl="2" lg="2" md="12" sm="12" xs="12" className="float-right right-0" >
                                                    {!!deviceInfo && <DeviceOptionCard handleClick={handleClick} deviceInfo={deviceInfo} systemId={rSelected} onDelete={deleteHandler} />}
                                                </Col>
                                                <Col xl="10" lg="10" md="12" sm="12" xs="12" style={{ alignItems: 'center', marginBottom: 20, width: "120%" }}>
                                                    {userInfo.role === "co" ||
                                                        redirected ||
                                                        company.systems.filter(system => system._id === rSelected)[0].admins.includes(userInfo._id)
                                                        || company.systems.filter(system => system._id === rSelected)[0].technicians.includes(userInfo._id) ? (
                                                            <div>
                                                                {!!deviceInfo && deviceInfo.system._id === rSelected ?
                                                                    (current !== "2" ? <MetricPane className="ml-20" statusInfo={statusInfo} /> : <AuditPane className="ml-20" statusInfo={statusInfo} />) :
                                                                    <Result
                                                                        status="404"
                                                                        title="404"
                                                                        subTitle="Sorry, the page you visited does not exist."
                                                                    />
                                                                }
                                                            </div>) : <Result
                                                            status="403"
                                                            title="403"
                                                            subTitle="Sorry, you are not authorized to access this page." />
                                                    }
                                                </Col>
                                            </Row>
                                        </TabPane>
                                    })}
                                </Tabs>
                            </TabPane>
                        })}
                    </Tabs>
                </Col>
            </Row>
            <Fab style={FabStyle} onClick={() => { setCollapse(!collapse) }}>
                <MdMessage size="30" />
            </Fab>
        </Page >

    )
}

export default Device;