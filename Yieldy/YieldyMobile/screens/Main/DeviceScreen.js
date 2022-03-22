import React, { useState, useCallback, useEffect } from 'react';
import {
    Text,
    View,
    Button,
    Image,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    Clipboard
} from 'react-native';
import { List as DList, DataTable } from 'react-native-paper';
import { Card, ListItem } from 'react-native-elements'
import { CardItem, Container, Content, Fab, Icon, Button as NButton, Body, Tabs, Tab, TabHeading, ScrollableTab } from 'native-base';
import Dialog from "react-native-dialog";
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts';
import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as deviceActions from '../../store/actions/device';
import Toast from 'react-native-tiny-toast';
import userDefault from '../../assets/users/userDefault.png';
import noresult from '../../assets/no-result.png';
import moment from 'moment';


const DeviceScreen = props => {

    const deviceId = props.navigation.getParam('deviceId');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [expandedDevice, setExpandedDevice] = useState(true);
    const [deleteDevice, setDeleteDevice] = useState(false);
    const dispatch = useDispatch();
    const deviceInfo = useSelector(state => state.device.fetchedDevice);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const status = useSelector(state => state.device.fetchedStatus);
    const deviceMetric = useSelector(state => state.device.deviceMetric);
    const deviceAudit = useSelector(state => state.device.deviceAudit);
    const [fabActive, setFabActive] = useState(false);
    const contentInset = { top: 20, bottom: 20 }


    const loadDevice = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(deviceActions.fetchdevicebyid(deviceId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);


    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadDevice
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadDevice]);

    useEffect(() => {
        setIsLoading(true);
        loadDevice().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadDevice]);

    useEffect(() => {
        if (!!deviceInfo) {
            try {
                dispatch(deviceActions.fetchStatus(deviceInfo.statusCode));
                dispatch(deviceActions.fetchMetricByDevice(deviceInfo.statusCode));
                dispatch(deviceActions.fetchAuditByDevice(deviceInfo.statusCode));
            } catch (error) {
                Toast.show(error.message);
            }
        }
    }, [deviceInfo])

    const deleteDeviceHandler = async () => {
        setIsLoading(true);
        try {
            await dispatch(
                deviceActions.deletedevice(deviceInfo.system._id, deviceInfo._id)
            );
            props.navigation.pop();
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
        }
    };
    const handleExpandeDevice = () => {
        setExpandedDevice(!expandedDevice);
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error.message}</Text>
                <Button
                    title="Try again"
                    onPress={loadDevice}
                    color={Color.primary}
                />
            </View>
        );
    }

    if (isLoading || isRefreshing || !!!deviceInfo || !!!loggedInfo || !!!status) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
            </View>
        );
    };

    return (
        <Container style={styles.description}>
            <Dialog.Container visible={deleteDevice}>
                <Dialog.Title>Do you really want to remove it? </Dialog.Title>
                <Dialog.Button label="Cancel " onPress={() => { setDeleteDevice(false) }} />
                <Dialog.Button color={Color.danger} label="Submit " onPress={deleteDeviceHandler} />
            </Dialog.Container>
            <Tabs renderTabBar={() => <ScrollableTab />} >
                <Tab heading="Shortcuts" >
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 60 }}
                        style={styles.scroll}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                        }>
                        <Content>
                            <Card
                                title='Device Description'>
                                <ListItem
                                    title={"Device Name: "}
                                    rightTitle={deviceInfo.name}
                                    bottomDivider
                                />
                                <ListItem
                                    title={"system name: "}
                                    rightTitle={
                                        <Text>{deviceInfo.system.name}</Text>
                                    }
                                    bottomDivider
                                />
                                <ListItem
                                    title={"Status Code: "}
                                    onPress={() => {
                                        Clipboard.setString(deviceInfo.statusCode);
                                        Toast.show("Status ccode copied to clipboard")
                                    }
                                    }
                                    rightTitle={
                                        <Text
                                            style={{ backgroundColor: Color.info }}
                                        >{deviceInfo.statusCode}</Text>
                                    }
                                    bottomDivider
                                />
                                {!!deviceMetric && deviceMetric.length > 0 ? <>
                                    <ListItem
                                        title={"Arch: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.architecture}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"hostname: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.hostname}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Os family: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.os.family}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Os vcersion: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.os.version}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Os Build: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.os.build}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Os kernel: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.os.kernel}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Os system: "}
                                        rightTitle={
                                            <Text>{deviceMetric[0]._source.host.os.name}</Text>
                                        }
                                        bottomDivider
                                    />
                                    <ListItem
                                        title={"Last Updated: "}
                                        rightTitle={
                                            <Text>{moment(new Date(deviceMetric[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                        }
                                        bottomDivider
                                    />

                                </> : <ListItem
                                        title={"Last Updated: "}
                                        rightTitle={
                                            <Text>No record has found, please configure beat</Text>
                                        }
                                        bottomDivider
                                    />}
                                <CardItem style={{ justifyContent: "center", alignContent: "space-between" }} >
                                    <Button
                                        title="Back to system "
                                        onPress={() => {
                                            props.navigation.popToTop()
                                                && props.navigation.navigate('System', {
                                                    systemId: deviceInfo.system._id,
                                                })
                                        }}
                                    />
                                </CardItem>
                            </Card>
                        </Content>
                    </ScrollView>
                </Tab>
                <Tab heading="Host detail">
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 60 }}
                        style={styles.scroll}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                        }>
                        <Content>
                            {!!deviceMetric && deviceMetric.length > 0 ?
                                <>
                                    <Card
                                        title="Device's Hosts">
                                        {deviceMetric[0]._source.host.ip.map((ip, i) => {
                                            return <ListItem
                                                key={i}
                                                subtitle={ip}
                                                onPress={() => {
                                                    Clipboard.setString(ip);
                                                    Toast.show("Ip adress copied to clipboard")
                                                }}
                                                bottomDivider
                                            />
                                        })}
                                        <ListItem
                                            title={"Last Updated: "}
                                            rightTitle={
                                                <Text>{moment(new Date(deviceMetric[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                            }
                                            bottomDivider
                                        />
                                    </Card>
                                    <Card
                                        title="Device's Macs">
                                        {deviceMetric[0]._source.host.mac.map((mac, i) => {
                                            return <ListItem
                                                key={i}
                                                subtitle={mac}
                                                onPress={() => {
                                                    Clipboard.setString(mac);
                                                    Toast.show("Mac adress copied to clipboard")
                                                }}
                                                bottomDivider
                                            />
                                        })}
                                        <ListItem
                                            title={"Last Updated: "}
                                            rightTitle={
                                                <Text>{moment(new Date(deviceMetric[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                            }
                                            bottomDivider
                                        />

                                    </Card>
                                </> :
                                <Card
                                    title="Device's Hosts">
                                    <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                        <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                    </CardItem>
                                </Card>
                            }
                        </Content>
                    </ScrollView>
                </Tab>
                {deviceMetric.filter((device) => {
                    return device._source.metricset.name === "process_summary"
                }).length > 0 &&
                    <Tab heading="Process Summary">
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 60 }}
                            style={styles.scroll}
                            refreshControl={
                                <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                            }>
                            <Content>
                                {!!deviceMetric && deviceMetric.length > 0 ?
                                    <>
                                        <Card
                                            title="Device's Hosts">
                                            <ListItem
                                                title={"Sleeping: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.sleeping) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.sleeping}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Unknown: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.unknown) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.unknown}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Stopped: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.stopped) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.stopped}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Running: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.running) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.running}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Zombie: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.zombie) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.zombie}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"dead: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.dead) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.dead}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Idle: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.idle) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.idle}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TOTAL: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.total) == 0 ? "0" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "process_summary"
                                                })[0]._source.system.process.summary.total}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Last Updated: "}
                                                rightTitle={
                                                    <Text>{moment(new Date(deviceMetric.filter((device) => {
                                                        return device._source.metricset.name === "process_summary"
                                                    })[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                                }
                                                bottomDivider
                                            />
                                        </Card>
                                    </> :
                                    <Card
                                        title="Device's Hosts">
                                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                        </CardItem>
                                    </Card>
                                }
                            </Content>
                        </ScrollView>
                    </Tab>
                }
                {deviceMetric.filter((device) => {
                    return device._source.metricset.name === "diskio"
                }).length > 0 &&
                    <Tab heading="Disk Detail">
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 60 }}
                            style={styles.scroll}
                            refreshControl={
                                <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                            }>
                            <Content>
                                {!!deviceMetric && deviceMetric.length > 0 ?
                                    <>
                                        <Card
                                            title="Disk detail">
                                            <ListItem
                                                title={"I/O Uptime: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.io.time / 1000 / 60) + " mins"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Read completed: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.read.count) == 0 ? "0 times" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.read.count + " times"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Read time spent: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.read.time / 1000 / 60) + " mins"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Bytes read: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.read.bytes) + " Bytes"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Write completed: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.write.count) == 0 ? "0 times" : deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.write.count + " times"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Write time spent: "}
                                                rightTitle={~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.write.time / 1000 / 60) + " mins"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Bytes Wrote: "}
                                                rightTitle={~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "diskio"
                                                })[0]._source.system.diskio.write.bytes) + " Bytes"}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Last Updated: "}
                                                rightTitle={
                                                    <Text>{moment(new Date(deviceMetric.filter((device) => {
                                                        return device._source.metricset.name === "diskio"
                                                    })[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                                }
                                                bottomDivider
                                            />
                                        </Card>
                                    </> :
                                    <Card
                                        title="Device's Hosts">
                                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                        </CardItem>
                                    </Card>
                                }
                            </Content>
                        </ScrollView>
                    </Tab>
                }
                {deviceMetric.filter((device) => {
                    return device._source.metricset.name === "socket_summary"
                }).length > 0 &&
                    <Tab heading="Socket summary">
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 60 }}
                            style={styles.scroll}
                            refreshControl={
                                <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                            }>
                            <Content>
                                {!!deviceMetric && deviceMetric.length > 0 ?
                                    <>
                                        <Card
                                            title="Socket summary">
                                            <ListItem
                                                title={"Total socket opened: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.all.count)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Total socket listening: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.all.listening)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Udp opened: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.udp.all.count)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TCP opened: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.tcp.all.count)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TCP Waiting for close: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.tcp.all.close_wait)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TCP time waited: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.tcp.all.time_wait)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TCP Listeining: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.tcp.all.listening)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"TCP Established: "}
                                                rightTitle={parseInt(~~(deviceMetric.filter((device) => {
                                                    return device._source.metricset.name === "socket_summary"
                                                })[0]._source.system.socket.summary.tcp.all.established)).toString()}
                                                bottomDivider
                                            />
                                            <ListItem
                                                title={"Last Updated: "}
                                                rightTitle={
                                                    <Text>{moment(new Date(deviceMetric.filter((device) => {
                                                        return device._source.metricset.name === "socket_summary"
                                                    })[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                                }
                                                bottomDivider
                                            />
                                        </Card>
                                    </> :
                                    <Card
                                        title="Device's Hosts">
                                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                        </CardItem>
                                    </Card>
                                }
                            </Content>
                        </ScrollView>
                    </Tab>
                }
                {deviceMetric.filter((device) => {
                    return device._source.metricset.name === "cpu"
                }).length > 0 && deviceMetric.filter((device) => {
                    return device._source.metricset.name === "memory"
                }).length > 0 &&
                    <Tab heading="Resource Performance">
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 60 }}
                            style={styles.scroll}
                            refreshControl={
                                <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                            }>
                            <Content>
                                <Card title='Status'>
                                    {status.length < 1 ? <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                        <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                    </CardItem> :
                                        <View>
                                            <CardItem header style={{ backgroundColor: "#ddd" }}>
                                                <Text>Cpu usage</Text>
                                            </CardItem>
                                            <CardItem>
                                                <Body style={{ height: 220, flexDirection: 'column', width: "100%" }}>
                                                    <View style={{ height: 200, flexDirection: 'row' }}>
                                                        <YAxis
                                                            data={deviceMetric.filter((device) => {
                                                                return device._source.metricset.name === "cpu"
                                                            }).map(status => status._source.system.cpu.system.norm.pct * 100)}
                                                            contentInset={contentInset}
                                                            svg={{
                                                                fill: 'grey',
                                                                fontSize: 10,
                                                            }}
                                                            numberOfTicks={10}
                                                            formatLabel={(value) => `${value}%`}
                                                        />
                                                        <LineChart
                                                            style={{ flex: 1, marginLeft: 16 }}
                                                            data={deviceMetric.filter((device) => {
                                                                return device._source.metricset.name === "cpu"
                                                            }).map(status => status._source.system.cpu.system.norm.pct * 100)}
                                                            svg={{ stroke: 'rgb(134, 65, 244)' }}
                                                            contentInset={contentInset}
                                                        >
                                                            <Grid />
                                                        </LineChart>
                                                    </View>
                                                </Body>
                                            </CardItem>
                                            <CardItem header style={{ backgroundColor: "#ddd" }}>
                                                <Text>Mem usage</Text>
                                            </CardItem>
                                            <CardItem>
                                                <Body
                                                    style={{ height: 220, flexDirection: 'column', width: "100%" }}>
                                                    <View style={{ height: 200, flexDirection: 'row' }}>
                                                        <YAxis
                                                            data={deviceMetric.filter((device) => {
                                                                return device._source.metricset.name === "memory"
                                                            }).map(status => status._source.system.memory.used.pct)}
                                                            contentInset={contentInset}
                                                            svg={{
                                                                fill: 'grey',
                                                                fontSize: 10,
                                                            }}
                                                            numberOfTicks={10}
                                                            formatLabel={(value) => `${Math.floor(value * 100)}%`}
                                                        />
                                                        <LineChart
                                                            style={{ flex: 1, marginLeft: 16 }}
                                                            data={deviceMetric.filter((device) => {
                                                                return device._source.metricset.name === "memory"
                                                            }).map(status => status._source.system.memory.used.pct)}
                                                            svg={{ stroke: 'rgb(134, 65, 244)' }}
                                                            contentInset={contentInset}
                                                        >
                                                            <Grid />
                                                        </LineChart>
                                                    </View>
                                                </Body>
                                            </CardItem>
                                            <ListItem
                                                title={"Last Updated: "}
                                                rightTitle={
                                                    <Text>{moment(new Date(deviceMetric[0]._source["@timestamp"])).format("MM-DD HH:mm")}</Text>
                                                }
                                                bottomDivider
                                            />
                                        </View>}
                                </Card>
                            </Content>
                        </ScrollView>
                    </Tab>
                }
                <Tab heading="Audit logs">
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 60 }}
                        style={styles.scroll}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={loadDevice} />
                        }>
                        <Content>
                            <Card >
                                <Text>Available at Web version</Text>
                            </Card>
                        </Content>
                    </ScrollView>
                </Tab>
            </Tabs>

            {loggedInfo.role !== "technicians" && <Fab
                active={fabActive}
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: Color.danger }}
                position="bottomRight"
                onPress={() => {
                    setFabActive(!fabActive);
                    setDeleteDevice(true);
                }}
            >
                <Icon name="trash" />
            </Fab>}
        </Container >
    );
};

DeviceScreen.navigationOptions = {
    headerTitle: 'DeviceScreen',
};

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: 'white',
    },
    image: {
        height: "50%",
        width: "100%",
        resizeMode: 'contain'
    },
    userRow: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 6,
    },
    userImage: {
        marginRight: 12,
    },
    listItemContainer: {
        height: 55,
        borderWidth: 0.5,
        borderColor: '#ECECEC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bigblue: {
        color: Color.primary,
        fontSize: 15,
        borderColor: Color.border,
        borderWidth: 1,
        textAlign: "center",
        backgroundColor: Color.content,
    },
});

export default DeviceScreen;