import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageSpinner } from '../BasicElement';
import { Card, Result, Tag, Table, List, } from 'antd';
import Fab from '@material-ui/core/Fab';
import { MdMessage } from 'react-icons/md';
import { Row, Col } from 'reactstrap';
import moment from 'moment';

const FabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
};

const Columns = [
    {
        title: 'type',
        dataIndex: 'type',
        fixed: 'left',
    },
    {
        title: 'User',
        dataIndex: 'user',
        fixed: 'left',
    },
    {
        title: 'PID',
        dataIndex: 'pid',
        fixed: 'left',
    },
    {
        title: 'Directory',
        dataIndex: 'directory',
    },
    {
        title: 'Name',
        dataIndex: 'name',
    }
    ,
    {
        title: 'Action',
        dataIndex: 'action',
    },
    {
        title: 'Date',
        dataIndex: 'date',
    }
];



const AuditPane = props => {

    const userInfo = useSelector(state => state.user.userProfile);
    const deviceInfo = useSelector(state => state.device.fetchedDevice);
    const deviceAudit = useSelector(state => state.device.deviceAudit);
    const [collapse, setCollapse] = useState(true);
    console.log(deviceAudit)

    if (!!!userInfo) {
        return <PageSpinner />
    }


    if (!!!deviceInfo || !!!deviceAudit) {
        return (<Result
            className="ml-20"
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />)
    }

    if (!!deviceAudit && deviceAudit.length < 1) {
        return (<Result
            className="ml-20"
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />)
    }
    return (
        <div >
            <Row >
                <Col lg="8" md="8" sm="12" xs="12" >
                    {!!deviceAudit && deviceAudit.length > 0 && <Card title="Audit Logs(Process)">
                        <Table
                            className="bg-white"
                            columns={Columns}
                            size="small"
                            scroll={{ x: "150%" }}
                            bordered
                            dataSource={deviceAudit.map((process, index) => {
                                return {
                                    key: index,
                                    type: <Tag color="red" key={index}>{process._source.type}</Tag>,
                                    user: process._source.user.name + " @id:" + process._source.user.id,
                                    pid: <Tag color="blue" key={index}>{process._source.pid}</Tag>,
                                    directory: <small>{process._source.process.executable}</small>,
                                    name: process._source.process.name,
                                    action: process._source.event.action,
                                    date: moment(new Date(process._source["@timestamp"])).format("MM-DD HH:mm")
                                }
                            })}
                        />
                    </Card>
                    }
                </Col>
                <Col lg="4" md="4" sm="12" xs="12" >
                    {!!deviceAudit && deviceAudit.length > 0 && <div> <Card title="Host Detail" >
                        <p>Arch: <strong>{deviceAudit[0]._source.host.architecture}</strong></p>
                        <p>hostname: <strong>{deviceAudit[0]._source.host.hostname}</strong></p>
                        <p>Os family: <strong>{deviceAudit[0]._source.host.os.family}</strong></p>
                        <p>Os vcersion: <strong>{deviceAudit[0]._source.host.os.version}</strong></p>
                        <p>Os Build: <strong>{deviceAudit[0]._source.host.os.build}</strong></p>
                        <p>Os kernel: <strong>{deviceAudit[0]._source.host.os.kernel}</strong></p>
                        <p>Os system: <strong>{deviceAudit[0]._source.host.os.name}</strong></p>
                        <p>Last Updated: <strong>{moment(new Date(deviceAudit[0]._source["@timestamp"])).format("MM-DD HH:mm")}</strong></p>
                    </Card>
                        <br />
                    </div>}
                    {!!deviceAudit && deviceAudit.length > 0 && <div> <Card title="Host Detail" >
                        <List
                            size="small"
                            header={<div><strong>Host ip:</strong></div>}
                            bordered
                            dataSource={deviceAudit[0]._source.host.ip}
                            renderItem={item => <List.Item>{item}</List.Item>}
                        />
                        <br />
                        <List
                            size="small"
                            header={<div><strong>Host mac:</strong></div>}
                            bordered
                            dataSource={deviceAudit[0]._source.host.mac}
                            renderItem={item => <List.Item>{item}</List.Item>}
                        />
                    </Card>
                        <br />
                    </div>}
                </Col>
            </Row>
            <Fab style={FabStyle} onClick={() => { setCollapse(!collapse) }}>
                <MdMessage size="30" />
            </Fab>
        </div>
    )
}

export default AuditPane;