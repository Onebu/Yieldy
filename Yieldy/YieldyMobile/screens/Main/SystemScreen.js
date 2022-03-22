import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Alert, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Image } from 'react-native';
import { ListItem as LItem } from 'react-native-elements';
import { List, DataTable } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container,
    Header,
    Content,
    Tab,
    Tabs,
    TabHeading,
    Icon,
    Card,
    Fab,
    CardItem,
    Separator,
    Accordion,
    Button as NButton,
    ListItem,
    Left,
    Body,
    Right,
    Thumbnail,
    ScrollableTab
} from 'native-base';
import Dialog from 'react-native-dialog';
import Toast from 'react-native-tiny-toast';
import moment from 'moment';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';
import * as systemActions from '../../store/actions/system';
import * as messageActions from '../../store/actions/message';
import * as deviceActions from '../../store/actions/device';
import userDefault from '../../assets/users/userDefault.png';
import noresult from '../../assets/no-result.png';
const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {

    if (action.type === FORM_INPUT_UPDATE) {
        const updatedValues = {
            ...state.inputValues,
            [action.input]: action.value
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        if (updatedValues.password !== updatedValues.repassword) {
            updatedFormIsValid = false;
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const SystemScreen = props => {

    const systemId = props.navigation.getParam('systemId');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fabActive, setFabActive] = useState(false);
    const [error, setError] = useState();
    const [expandedAdmin, setExpandedAdmin] = useState(false);
    const [expandedTech, setExpandedTech] = useState(false);
    const [expandedDevice, setExpandedDevice] = useState(true);
    const [createDevice, setCreateDevice] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [deleteSystem, setDeleteSystem] = useState(false);
    const dispatch = useDispatch();
    const systemInfo = useSelector(state => state.system.systemInfo);
    const messageInfo = useSelector(state => state.message.fetchedMessages);
    const loggedInfo = useSelector(state => state.user.userProfile);


    const loadSystem = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(systemActions.fetchSystemById(systemId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            content: ''
        },
        inputValidities: {
            content: false,
        },
        formIsValid: false
    });

    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                isValid: inputValidity,
                input: inputIdentifier
            });
        },
        [dispatchFormState]
    );


    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadSystem
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadSystem]);

    useEffect(() => {
        setIsLoading(true);
        loadSystem().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadSystem]);

    const handleExpandeDevice = () => {
        setExpandedDevice(!expandedDevice);
    }

    const handleExpandedAdmin = () => {
        setExpandedAdmin(!expandedAdmin);
    }

    const handleExpandedTech = () => {
        setExpandedTech(!expandedTech);
    }

    const createDeviceHandler = async () => {
        try {
            await dispatch(deviceActions.createdevice(deviceName, systemInfo._id))
                .then(setCreateDevice(false)).then(setDeviceName(""));
        } catch (err) {
            Toast.show(err.message);
        }
    }

    const deleteSystemHandler = async () => {
        setIsLoading(true);
        try {
            await dispatch(
                systemActions.deleteSystem(systemInfo._id)
            ).then(props.navigation.pop());
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
        }
    };



    const sendMessageHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                messageActions.createmessage(formState.inputValues.content, systemInfo._id, loggedInfo._id)
            );
            setIsLoading(false);
            loadSystem();
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error.message}</Text>
                <Button
                    title="Try again"
                    onPress={loadSystem}
                    color={Color.primary}
                />
            </View>
        );
    }

    if (isLoading || isRefreshing || !!!loggedInfo || !!!systemInfo) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
            </View>
        );
    };


    if (loggedInfo.role !== "co" && !systemInfo.admins.map(admin => { return admin._id }).includes(loggedInfo._id) &&
        !systemInfo.technicians.map(tech => { return tech._id }).includes(loggedInfo._id)) {
        Alert.alert(
            'An Error Occured!',
            error,
            [
                { text: 'You shall not pass', onPress: () => { props.navigation.pop() } }
            ]
        )
    }
    return (
        <Container scrollEnabled style={styles.description}>
            <ScrollView style={styles.description}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={loadSystem} />
                }>
                <Dialog.Container visible={createDevice}>
                    <Dialog.Title>Create Device</Dialog.Title>
                    <Dialog.Input
                        style={{ backgroundColor: "#ccc" }}
                        placeholder="Device Name"
                        onChangeText={text => setDeviceName(text)}
                    />
                    <Dialog.Button label="Cancel " onPress={() => { setCreateDevice(false) }} />
                    <Dialog.Button disabled={!!!deviceName} label="Submit " onPress={createDeviceHandler} />
                </Dialog.Container>
                <Dialog.Container visible={deleteSystem}>
                    <Dialog.Title >Are your sure??</Dialog.Title>
                    <Dialog.Button label="Cancel " onPress={() => { setDeleteSystem(false) }} />
                    <Dialog.Button label="Submit " onPress={deleteSystemHandler} />
                </Dialog.Container>
                <Card style={{backgroundColor:"#ccc"}}>
                    <CardItem header>
                        <Text>
                            System Description
                    </Text>
                    </CardItem>
                    <LItem
                        title={"Name: "}
                        rightTitle={systemInfo.name}
                        bottomDivider
                    />
                    <LItem
                        title={"Company: "}
                        rightTitle={systemInfo.company.name}
                        bottomDivider
                    />
                    <CardItem style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
                        <NButton
                            disabled={loggedInfo.role !== "co"}
                            danger
                            style={{ paddingHorizontal: 20 }}
                            onPress={() => { setDeleteSystem(true) }}
                        >
                            <Text>Delete System?</Text>
                        </NButton>
                    </CardItem>
                </Card>
                <Tabs renderTabBar={() => <ScrollableTab />}>
                    <Tab heading="Device's List">
                        <Content>
                            <List.Accordion
                                style={{
                                    backgroundColor: Color.info,
                                    borderColor: "#EEE",
                                    borderWidth: 1,
                                    marginHorizontal: 2
                                }}
                                title="Devices"
                                expanded={expandedDevice}
                            >
                                <DataTable style={{
                                    borderColor: Color.info,
                                    borderWidth: 1,
                                    marginHorizontal: 2
                                }}>
                                    <DataTable.Header>
                                        <DataTable.Title>Name</DataTable.Title>
                                        <DataTable.Title
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            Detail</DataTable.Title>
                                    </DataTable.Header>
                                    {systemInfo.devices.length < 1 && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                        <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                    </CardItem>}
                                    {
                                        systemInfo.devices.map((l, i) => (
                                            <DataTable.Row key={i} style={{ backgroundColor: i % 2 == 0 ? "#ddd" : "" }}>
                                                <DataTable.Cell>{l.name}</DataTable.Cell>
                                                <DataTable.Cell
                                                    style={{
                                                        flex: 1,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textDecorationLine: 'underline',
                                                    }}
                                                    onPress={() => {
                                                        props.navigation.navigate('DeviceScreen', {
                                                            deviceId: l._id
                                                        })
                                                    }}
                                                >More...</DataTable.Cell>
                                            </DataTable.Row>
                                        ))
                                    }
                                </DataTable>
                                {loggedInfo.role !== "technicians" && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginBottom: 20, marginTop: 20 }}>
                                    <Button
                                        disabled={loggedInfo.role === "technicians"}
                                        title="Create one? "
                                        onPress={() => {
                                            setCreateDevice(true);
                                        }}
                                        style={{ paddingTop: 5 }}
                                    >
                                    </Button>
                                </CardItem>}
                            </List.Accordion>
                        </Content>
                    </Tab>
                    <Tab heading="Admin's List">
                        <Content>
                            <List.Accordion
                                style={{
                                    backgroundColor: Color.info,
                                    borderColor: "#EEE",
                                    borderWidth: 1,
                                    marginHorizontal: 2
                                }}
                                title="Admins"
                                expanded={true}
                            >
                                <Card>
                                    {systemInfo.admins.length < 1 && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                        <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                    </CardItem>}
                                    {
                                        systemInfo.admins.map((l, i) => (
                                            <ListItem avatar style={l.confirmed ? styles.rowFront : styles.rowFrontUnConfirmed} key={l._id}>
                                                <Left style={{ marginLeft: 10 }}>
                                                    <Thumbnail source={!!l.profileImage ? ({ uri: l.profileImage.cloudImage }) : userDefault} />
                                                </Left>
                                                <Body>
                                                    <Text style={{ fontSize: 18, marginLeft: 5, marginBottom: 2 }}>{!!l.name ? l.name + "(" + l.username + ")" : l.username}</Text>
                                                    <Text>{l.email}</Text>
                                                </Body>
                                                <Right>
                                                    <Text>{l.role}</Text>
                                                </Right>
                                            </ListItem>
                                        ))
                                    }
                                    {loggedInfo.role === "co" && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginBottom: 20, marginTop: 20 }}>
                                        <Button
                                            title="Edit!"
                                            onPress={() => {
                                                props.navigation.navigate('EditSystemMember', {
                                                    systemId: systemInfo._id,
                                                    type: "admin"
                                                })
                                            }}
                                            style={{ paddingTop: 5 }}
                                        >
                                        </Button>
                                    </CardItem>}
                                </Card>
                            </List.Accordion>
                        </Content>
                    </Tab>
                    <Tab heading="Tehcnicians List">
                        <Content>
                            <List.Accordion
                                style={{
                                    backgroundColor: Color.info,
                                    borderColor: "#EEE",
                                    borderWidth: 1,
                                    marginHorizontal: 2
                                }}
                                title="Technicians"
                                expanded={true}
                            >
                                <Card>
                                    {systemInfo.technicians.length < 1 && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                        <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                    </CardItem>}
                                    {
                                        systemInfo.technicians.map((l, i) => (
                                            <ListItem avatar style={l.confirmed ? styles.rowFront : styles.rowFrontUnConfirmed} key={l._id}>
                                                <Left style={{ marginLeft: 10 }}>
                                                    <Thumbnail source={!!l.profileImage ? ({ uri: l.profileImage.cloudImage }) : userDefault} />
                                                </Left>
                                                <Body>
                                                    <Text style={{ fontSize: 18, marginLeft: 5, marginBottom: 2 }}>{!!l.name ? l.name + "(" + l.username + ")" : l.username}</Text>
                                                    <Text>{l.email}</Text>
                                                </Body>
                                                <Right>
                                                    <Text>{l.role}</Text>
                                                </Right>
                                            </ListItem>
                                        ))
                                    }
                                    {loggedInfo.role === "co" && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginBottom: 20, marginTop: 20 }}>
                                        <Button
                                            title="Edit!"
                                            onPress={() => {
                                                props.navigation.navigate('EditSystemMember', {
                                                    systemId: systemInfo._id,
                                                    type: "technician"
                                                })
                                            }}
                                            style={{ paddingTop: 5 }}
                                        >
                                        </Button>
                                    </CardItem>}
                                </Card>
                            </List.Accordion>
                        </Content>
                    </Tab>
                </Tabs>

            </ScrollView>
            <Fab
                active={fabActive}
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: '#5067FF' }}
                position="bottomRight"
                onPress={() => {
                    setFabActive(!fabActive);
                }}
            >
                <Icon name="more" />
                <NButton
                    onPress={() => {
                        props.navigation.navigate('TaskScreen', {
                            systemId: systemInfo._id,
                            role: loggedInfo.role
                        })
                    }}
                >
                    <Icon name="md-checkbox-outline" />
                </NButton>
                <NButton
                    onPress={() => {
                        props.navigation.navigate('MessageScreen', {
                            systemId: systemInfo._id,
                            role: loggedInfo.role
                        })
                    }}>
                    <Icon name="md-chatboxes" />
                </NButton>
            </Fab>
        </Container>
    );
};

SystemScreen.navigationOptions = {
    headerTitle: 'SystemScreen'
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
    description: {
        flex: 1,
    },
    content: {
        flex: 3,
        backgroundColor: Color.content
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: "#FFF",
        justifyContent: 'center',
        flex: 1,
        marginLeft: 0,
        borderColor: Color.info,
        paddingBottom: 10
    },
    rowFrontUnConfirmed: {
        alignItems: 'center',
        backgroundColor: Color.warning,
        justifyContent: 'center',
        flex: 1,
        marginLeft: 0
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: Color.secondary,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
export default SystemScreen;