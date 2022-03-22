import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Fab from '@material-ui/core/Fab';
import { MdMessage } from 'react-icons/md';
import LoadingOverlay from 'react-loading-overlay';
import { Popover, Button, Radio, Drawer, Result } from 'antd';
import "antd/dist/antd.css";

import * as companyActions from '../../store/actions/company';
import * as systemActions from '../../store/actions/system';
import { PageSpinner, Page } from 'components/BasicElement';
import { SystemCard, DeviceCard, TodosCard, MessageCard } from 'components/Card';
import { Row, Col, Collapse } from 'reactstrap';
import { useWindowDimensions } from '../../utils/dimension';
import { useHistory } from 'react-router';

const FabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
};

const System = props => {

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showMember, setShowMember] = useState(false);
    const [noneContent, setNoneContet] = useState(false);
    const company = useSelector(state => state.company.companies[0]);
    const system = useSelector(state => state.system.systemInfo);
    const userInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();
    const [collapse, setCollapse] = useState(true);
    const systemId = props.history.location.state;
    const { width } = useWindowDimensions();
    const history = useHistory();

    const [rSelected, setRSelected] = useState(!!systemId ? systemId["systemId"] : null);
    let btnGroupContent = null;


    useEffect(() => {
        setIsLoading(true);
        async function fetchCompany() {
            await dispatch(companyActions.fetchCompany())
        }
        fetchCompany().then(setIsLoading(false));
        window.scrollTo(0, 0);
        return () => { }
    }, [dispatch])

    useEffect(() => {
        if (!!company && company.systems.length > 0) {
            if (!!!systemId) {
                setRSelected(company.systems[0]._id);
            }
        } else {
            setNoneContet(true);
        }
    }, [btnGroupContent, company, systemId])

    useEffect(() => {
        setIsRefreshing(true);
        async function fetchSystem() {
            await dispatch(systemActions.fetchSystemById(rSelected));
        }
        if (!!rSelected) {
            fetchSystem().then(setIsRefreshing(false));
        }
    }, [rSelected, dispatch])

    if (noneContent) {
        history.push('/company');
    }

    if (isLoading || !!!company || !!!userInfo || !!!system) {
        return (
            <PageSpinner />
        )
    }

    if (!isLoading && !!company && !!userInfo && !!system) {
        btnGroupContent = company.systems.map((system) => {
            return <Popover content={"Click to switch system"} key={system._id} title="Hint" trigger="hover">
                <Button
                    type={system._id === rSelected && "primary"}
                    value={system._id}
                    color="primary"
                    onClick={() => setRSelected(system._id)}>
                    {system.name}
                </Button>
            </Popover>
        })
    }
    return (
        <LoadingOverlay
            active={isRefreshing}
            spinner
            text='Loading your content...'
        >
            <Page style={{ margin: 20 }} >
                <Drawer
                    width={width < 800 ? "70%" : 500}
                    title="Comments"
                    placement="right"
                    closable
                    onClose={() => setCollapse(!collapse)}
                    visible={!collapse}
                >
                    {!collapse && <MessageCard style={{ width: 300 }} system={system._id} />}
                </Drawer>
                <div>
                    <hr className="hr-text" data-content="System" />
                </div>
                <Row>
                    <Col xl="10" lg="10" md="10" sm="12" xs="12" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 }}>
                        <Radio.Group value={rSelected}>
                            {btnGroupContent}
                        </Radio.Group>
                    </Col>
                    {(userInfo.role === "co" ||
                        system.admins.map(admin => { return admin._id }).includes(userInfo._id) ||
                        system.technicians.map(tech => { return tech._id }).includes(userInfo._id)) && <Col xl="2" lg="2" md="2" sm="12" xs="12" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
                            <Button className="right-0" onClick={() => setShowMember(!showMember)} >
                                {showMember ? <small>Show Members</small> : <small>Hide Members</small>}
                            </Button>
                        </Col>
                    }
                </Row>
                {userInfo.role === "co" ||
                    system.admins.map(admin => { return admin._id }).includes(userInfo._id) ||
                    system.technicians.map(tech => { return tech._id }).includes(userInfo._id) ? ( //check if user belong to this system
                        <div>
                            <Row >
                                <Col lg={!showMember ? "8" : "12"} md="12" sm="12" xs="12" >
                                    <TodosCard todos={system.tasks} className="mb-4" />
                                </Col>
                                <Col lg="4" md="12" sm="12" xs="12" >
                                    <Collapse isOpen={!showMember}>
                                        <SystemCard color="info" className="mb-4" />
                                    </Collapse>
                                    <DeviceCard />
                                </Col>
                                <Fab style={FabStyle} onClick={() => { setCollapse(!collapse) }}>
                                    <MdMessage size="30" />
                                </Fab>
                            </Row>
                        </div>) : <Result
                        status="403"
                        title="403"
                        subTitle="Sorry, you are not authorized to access this page."
                    />}
            </Page>
        </LoadingOverlay>
    )
}

export default System;