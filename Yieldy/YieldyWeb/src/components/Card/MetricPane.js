import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageSpinner } from '../BasicElement';
import { Card, Result, Tag, Table, List, } from 'antd';
import Fab from '@material-ui/core/Fab';
import { MdMessage } from 'react-icons/md';
import { Line, } from 'react-chartjs-2';
import { Row, Col, CardBody } from 'reactstrap';
import moment from 'moment';
import { getColor } from '../../utils/colors';

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
        title: 'Type',
        dataIndex: 'type',
    },
    {
        title: 'Packets send',
        dataIndex: 'packet_out',
    },
    {
        title: 'Bytes send',
        dataIndex: 'bytes_out',
    },
    {
        title: 'Packets received',
        dataIndex: 'packet_in',
    },
    {
        title: 'Bytes received',
        dataIndex: 'bytes_in',
    },
    {
        title: 'Date',
        dataIndex: 'date',
    }
];

const genLineData = (data, barLabel, chartLabel) => {
    return {
        labels: barLabel.reverse(),
        datasets: [
            {
                label: chartLabel,
                backgroundColor: getColor('primary'),
                borderColor: getColor('primary'),
                borderWidth: 1,
                data: data.reverse(),
            },
        ],
    };
};


const MetricPane = props => {

    const userInfo = useSelector(state => state.user.userProfile);
    const deviceInfo = useSelector(state => state.device.fetchedDevice);
    const deviceMetric = useSelector(state => state.device.deviceMetric);
    const [collapse, setCollapse] = useState(true);

    if (!!!userInfo) {
        return <PageSpinner />
    }


    if (!!!deviceInfo || !!!deviceMetric) {
        return (<Result
            className="ml-8"
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />)
    }

    if (!!deviceMetric && deviceMetric.length < 1) {
        return (<Result
            className="ml-8"
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />)
    }
    return (
        <div >
            <Row >
                <Col lg="8" md="8" sm="12" xs="12" >
                    {!!deviceMetric && deviceMetric.filter((device) => {
                        return device._source.metricset.name === "cpu"
                    }).length > 0 && <div> < Card >
                        <CardBody>
                            <Line
                                data={genLineData(
                                    deviceMetric.filter((device) => {
                                        return device._source.metricset.name === "cpu"
                                    }).map(status => status._source.system.cpu.system.norm.pct * 100),
                                    deviceMetric.filter((device) => {
                                        return device._source.metricset.name === "cpu"
                                    }).map(status => moment(new Date(status._source["@timestamp"])).format("MM-DD HH:mm")),
                                    "Cpu Usage(%)"
                                )}
                            />
                        </CardBody>
                    </Card>
                        </div>
                    }
                    <br />
                    {!!deviceMetric && deviceMetric.filter((device) => {
                        return device._source.metricset.name === "memory"
                    }).length > 0 && <div>
                            < Card >
                                <CardBody>
                                    <Line
                                        data={genLineData(
                                            deviceMetric.filter((device) => {
                                                return device._source.metricset.name === "memory"
                                            }).map(status => status._source.system.memory.used.pct * 100),
                                            deviceMetric.filter((device) => {
                                                return device._source.metricset.name === "memory"
                                            }).map(status => moment(new Date(status._source["@timestamp"])).format("MM-DD HH:mm")),
                                            "Mem. Usage(%)"
                                        )}
                                    />
                                </CardBody>
                            </Card>
                        </div>
                    }
                    <br />
                    {!!deviceMetric && deviceMetric.filter((device) => {
                        return device._source.metricset.name === "socket_summary"
                    }).length > 0 && <Card title="Socket Summary">
                            <span>Summary</span>
                            <Table
                                responsive
                                className="bg-white"
                                columns={[{
                                    title: 'Opened',
                                    dataIndex: 'opened',
                                }, {
                                    title: 'Listening',
                                    dataIndex: 'listening',
                                },
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                }
                                ]}
                                size="small"
                                dataSource={deviceMetric.filter((device) => {
                                    return device._source.metricset.name === "socket_summary"
                                }).map((connection, index) => {
                                    return {
                                        key: index,
                                        opened: connection._source.system.socket.summary.all.count,
                                        listening: connection._source.system.socket.summary.all.listening,
                                        date: moment(new Date(connection._source["@timestamp"])).format("MM-DD HH:mm")
                                    }
                                })}
                            />
                            <span>UDP</span>
                            <Table
                                responsive
                                className="bg-white"
                                columns={[{
                                    title: 'Count',
                                    dataIndex: 'opened',
                                },
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                }]}
                                size="small"
                                dataSource={deviceMetric.filter((device) => {
                                    return device._source.metricset.name === "socket_summary"
                                }).map((connection, index) => {
                                    return {
                                        key: index,
                                        opened: connection._source.system.socket.summary.udp.all.count,
                                        date: moment(new Date(connection._source["@timestamp"])).format("MM-DD HH:mm")
                                    }
                                })}
                            />
                            <span>TCP</span>
                            <Table
                                responsive
                                className="bg-white"
                                columns={[{
                                    title: 'Count',
                                    dataIndex: 'opened',
                                },
                                {
                                    title: 'Waiting for close',
                                    dataIndex: 'close_wait',
                                },
                                {
                                    title: 'Time waited',
                                    dataIndex: 'time_wait',
                                },
                                {
                                    title: 'Listeining',
                                    dataIndex: 'listening',
                                },
                                {
                                    title: 'Established',
                                    dataIndex: 'established',
                                },
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                }
                                ]}
                                size="small"
                                dataSource={deviceMetric.filter((device) => {
                                    return device._source.metricset.name === "socket_summary"
                                }).map((connection, index) => {
                                    return {
                                        key: index,
                                        opened: connection._source.system.socket.summary.tcp.all.count,
                                        close_wait: connection._source.system.socket.summary.tcp.all.close_wait,
                                        time_wait: connection._source.system.socket.summary.tcp.all.time_wait,
                                        listening: connection._source.system.socket.summary.tcp.all.listening,
                                        established: connection._source.system.socket.summary.tcp.all.established,
                                        date: moment(new Date(connection._source["@timestamp"])).format("MM-DD HH:mm")
                                    }
                                })}
                            />
                        </Card>
                    }
                </Col>
                <Col lg="4" md="4" sm="12" xs="12" >
                    {!!deviceMetric && deviceMetric.length > 0 && <div> <Card title="Host Detail" >
                        <p>Arch: <strong>{deviceMetric[0]._source.host.architecture}</strong></p>
                        <p>hostname: <strong>{deviceMetric[0]._source.host.hostname}</strong></p>
                        <p>Os family: <strong>{deviceMetric[0]._source.host.os.family}</strong></p>
                        <p>Os vcersion: <strong>{deviceMetric[0]._source.host.os.version}</strong></p>
                        <p>Os Build: <strong>{deviceMetric[0]._source.host.os.build}</strong></p>
                        <p>Os kernel: <strong>{deviceMetric[0]._source.host.os.kernel}</strong></p>
                        <p>Os system: <strong>{deviceMetric[0]._source.host.os.name}</strong></p>
                        <p>Last Updated: <strong>{moment(new Date(deviceMetric[0]._source["@timestamp"])).format("MM-DD HH:mm")}</strong></p>
                    </Card>
                        <br />
                    </div>}
                    {!!deviceMetric && deviceMetric.filter((device) => {
                        return device._source.metricset.name === "diskio"
                    }).length > 0 && <div> <Card title="Disk Detail" >
                        <p>I/O Uptime: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.io.time / 1000 / 60)} mins</strong></p>
                        <p>Read completed: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.read.count)} times</strong></p>
                        <p>Read time spent: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.read.time / 1000 / 60)} mins</strong></p>
                        <p>Bytes read: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.read.bytes)} Bytes</strong></p>
                        <p>Write completed: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.write.count)} times</strong></p>
                        <p>Write time spent: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.write.time / 1000 / 60)} times</strong></p>
                        <p>Bytes wrote: <strong>{Math.abs(~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "diskio"
                        })[0]._source.system.diskio.write.bytes))} Bytes</strong></p>
                    </Card>
                            <br />
                        </div>
                    }
                    {!!deviceMetric && deviceMetric.filter((device) => {
                        return device._source.metricset.name === "process_summary"
                    }).length > 0 && <div> <Card title="Process Summary" >
                        <p>Sleeping: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.sleeping)}</strong></p>
                        <p>Unknown: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.unknown)}</strong></p>
                        <p>Stopped: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.stopped)}</strong></p>
                        <p>Running: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.running)}</strong></p>
                        <p>Zombie: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.zombie)}</strong></p>
                        <p>dead: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.dead)}</strong></p>
                        <p>Idle: <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.idle)}</strong></p>
                        <p>TOTAL:<i> <strong>{~~(deviceMetric.filter((device) => {
                            return device._source.metricset.name === "process_summary"
                        })[0]._source.system.process.summary.total)}</strong></i></p>
                    </Card>
                            <br />
                        </div>
                    }
                    {!!deviceMetric && deviceMetric.length > 0 && <div> <Card title="Host Detail" >
                        <List
                            size="small"
                            header={<div><strong>Host ip:</strong></div>}
                            bordered
                            dataSource={deviceMetric[0]._source.host.ip}
                            renderItem={item => <List.Item>{item}</List.Item>}
                        />
                        <br />
                        <List
                            size="small"
                            header={<div><strong>Host mac:</strong></div>}
                            bordered
                            dataSource={deviceMetric[0]._source.host.mac}
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

export default MetricPane;