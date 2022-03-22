import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Text, View, Button, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { NavigationActions } from 'react-navigation';

import * as systemActions from '../../store/actions/system';
import * as messageActions from '../../store/actions/message';
import { Container, Content, Form, Textarea, CardItem, Picker, Card } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import Color from '../../constants/colors';
import publish from '../../assets/publish.png';
import reply from '../../assets/reply.jpeg';
import Dialog from "react-native-dialog";
import noresult from '../../assets/no-result.png';


const PublishScreen = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [content, setContent] = useState("");
    const [device, setDevice] = useState("Device");
    const [task, setTask] = useState("Task");
    const [editDevice, setEditDevice] = useState(false);
    const [editTask, setEditTask] = useState(false);
    const dispatch = useDispatch();
    const fetchedMessage = useSelector(state => state.message.messageById);
    const systemInfo = useSelector(state => state.system.systemInfo);
    const type = props.navigation.getParam('type');
    const messageId = props.navigation.getParam('messageId');
    const systemId = props.navigation.getParam('systemId');


    const loadMessage = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            if (!!messageId) {
                await dispatch(messageActions.fetchMessageById(messageId));
                await dispatch(systemActions.fetchSystemById(systemId));
            }
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        if (!!messageId) {
            const willFocusSub = props.navigation.addListener(
                'willFocus',
                loadMessage
            );

            return () => {
                willFocusSub.remove();
            };
        }
    }, [loadMessage]);

    useEffect(() => {
        setIsLoading(true);
        loadMessage().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadMessage]);

    const publishHandler = async () => {
        if (type === "publish") {
            await dispatch(
                messageActions.createMessage(
                    content,
                    systemId,
                    device === "Device" ? null : device,
                    task === "Task" ? null : task,
                )).then(props.navigation.pop());
        } else if (type === "reply") {
            await dispatch(
                messageActions.replyMessage(
                    content,
                    messageId,
                    systemId
                )).then(props.navigation.pop());
        }
    }
    if (!!error) {
        return (
            <View style={styles.centered}>
                <Text>{error.message}</Text>
                <Button
                    title="Try again"
                    onPress={loadMessage}
                    color={Color.primary}
                />
            </View>
        );
    }


    if (isLoading || !!!systemInfo) {
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
        <Container>
            <Dialog.Container visible={editTask}>
                <Dialog.Title>@ Task</Dialog.Title>
                <Picker
                    note
                    mode="dropdown"
                    style={{ height: 120 }}
                    selectedValue={task}
                    onValueChange={(text) =>
                        setTask(text)
                    }
                >
                    <Picker.Item label="Select Task" value="Task" />
                    {systemInfo.tasks.map(task => (
                        <Picker.Item key={task._id} label={task.content.substring(0, 10)} value={task._id} />
                    ))}
                </Picker>
                <Dialog.Button label="Cancel " onPress={() => {
                    setTask("Task");
                    setEditTask(false);
                }} />
                <Dialog.Button label="Mention " onPress={() => {
                    setEditTask(false)
                }} />
            </Dialog.Container>
            <Dialog.Container visible={editDevice}>
                <Dialog.Title>@ Device</Dialog.Title>
                <Picker
                    note
                    mode="dropdown"
                    style={{ height: 120 }}
                    selectedValue={device}
                    onValueChange={(text) =>
                        setDevice(text)
                    }
                >
                    <Picker.Item label="Select Device" value="Device" />
                    {systemInfo.devices.map(device => (
                        <Picker.Item key={device._id} label={device.name} value={device._id} />
                    ))}
                </Picker>
                <Dialog.Button label="Cancel " onPress={() => {
                    setDevice("Device");
                    setEditDevice(false);
                }} />
                <Dialog.Button label="Mention " onPress={() => {
                    setEditDevice(false);
                }} />
            </Dialog.Container>
            {
                type === "reply" &&
                <Content>
                    <Card>
                        <CardItem header bordered>
                            <Text>Replying</Text>
                        </CardItem>
                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Image source={reply} style={{ height: 280, width: "100%", marginBottom: 20 }} />
                        </CardItem>
                    </Card>
                </Content>
            }
            {
                type === "publish" ? <Content  style={{flex:1}}>
                    <Card>
                        <CardItem header bordered>
                            <Text>Publishing</Text>
                        </CardItem>
                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Image source={publish} style={{ height: 280, width: "100%", marginBottom: 20 }} />
                        </CardItem>
                    </Card>
                    <Form>
                        <Textarea rowSpan={5} onChangeText={text => setContent(text)} bordered placeholder="Textarea" />
                    </Form>
                    <View style={styles.buttonGroup}>
                        <Button color={Color.warning}
                            title={"@Device "}
                            onPress={() => setEditDevice(true)}
                        />
                        <Button
                            color={Color.warning}
                            title={"@Task"}
                            onPress={() => setEditTask(true)}
                        />
                        <Button
                            disabled={!!!content}
                            color={Color.secondary}
                            title="Publish "
                            onPress={publishHandler}
                        />
                    </View>
                </Content> : <View style={styles.textArea}>
                        <Form>
                            <Textarea onChangeText={text => setContent(text)} rowSpan={5} bordered placeholder="Textarea" />
                        </Form>
                        <View style={styles.buttonGroup}>
                            <Button
                                disabled={!!!content}
                                color={Color.secondary}
                                title="Reply "
                                onPress={publishHandler}
                            />
                        </View>
                    </View>
            }
        </Container >
    );
};

PublishScreen.navigationOptions = {
    headerTitle: 'PublishScreen'
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
    buttonGroup: {
        width: "90%",
        marginHorizontal: 20,
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
    ,
    content: {
        flex: 1
    },
    textArea: {
        height: 200
    },
    contentPublish: {
        flex: 1,
        alignContent: 'flex-end'
    }
});


export default PublishScreen;