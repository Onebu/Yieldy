import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { ListItem } from 'react-native-elements'
import { useSelector, useDispatch } from 'react-redux';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as taskActions from '../../store/actions/task';
import userDefault from '../../assets/users/userDefault.png';
import moment from 'moment';
import Toast from 'react-native-tiny-toast';
import noresult from '../../assets/no-result.png';
import { Container, Content, Card, CardItem, Fab, Icon } from 'native-base';
import Dialog from 'react-native-dialog';

const TaskDetailScreen = props => {

    const taskId = props.navigation.getParam('taskId');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const [editMember, setEditMember] = useState(false);
    const dispatch = useDispatch();
    const taskInfo = useSelector(state => state.task.fetchedTaskById);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const systemInfo = useSelector(state => state.system.systemInfo);

    const loadTask = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(taskActions.fetchTaskById(taskId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);



    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadTask
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadTask]);

    useEffect(() => {
        setIsLoading(true);
        loadTask().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadTask]);

    const deleteTaskhandler = async () => {
        setIsLoading(true);
        try {
            await dispatch(
                taskActions.deleteTask(taskInfo._id, systemInfo._id)
            );
            props.navigation.pop();
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
        }
    };

    const editStatusHandler = async () => {
        setIsLoading(true);
        try {
            let s;
            if (taskInfo.status === "WIP") {
                s = "done";
            } else {
                s = "WIP";
            }
            await dispatch(
                taskActions.updateTaskById(taskInfo._id, s, systemInfo._id)
            );
            setIsLoading(false);
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
        }
    }

    const revokeHandler = async (taskId, userId) => {
        setIsLoading(true);
        try {
            await dispatch(
                taskActions.revokeTechnician(
                    taskId,
                    userId,
                    systemInfo._id
                )
            );
            setIsLoading(false);
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
        }
    };

    const assignHandler = async (taskId, userId) => {
        setIsLoading(true);
        try {
            await dispatch(
                taskActions.assignTechnician(
                    taskId,
                    userId,
                    systemInfo._id
                )
            );
            setIsLoading(false);
            setEditMember(false);
        } catch (err) {
            Toast.show(err.message);
            setIsLoading(false);
            setEditMember(false);
        }
    };
    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
                <Button
                    title="Try again"
                    onPress={loadTask}
                    color={Color.primary}
                />
            </View>
        );
    }

    if (isLoading || isRefreshing || !!!loggedInfo || !!!systemInfo || !!!taskInfo) {
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
        <Container >
            <Content style={{ flex: 1 }}>
                <Dialog.Container visible={editMember}>
                    <Dialog.Title>Assign Member</Dialog.Title>
                    {systemInfo.technicians.map((l, i) => (
                        <ListItem
                            key={i}
                            title={!!l.name ? l.name + "(" + l.username + ")" : l.username}
                            subtitle={l.email}
                            rightTitle={l.confirmed ? ("Confirmed") : ("Not confirmed")}
                            onPress={() => { assignHandler(taskInfo._id, l._id) }}
                        />
                    ))
                    }
                    <Dialog.Button label="Cancel " onPress={() => { setEditMember(false) }} />
                </Dialog.Container>
                <Card>
                    <CardItem header bordered style={{ backgroundColor: "#bbb" }}>
                        <Text>Task Detail</Text>
                    </CardItem>
                    <ListItem
                        title={"Task Status: "}
                        rightTitle={taskInfo.status}
                    />
                    <ListItem
                        title={"Task content: "}
                        rightTitle={taskInfo.content}
                    />
                    <ListItem
                        title={"Due date: "}
                        rightTitle={moment(new Date(taskInfo.duedate)).format("MM-DD HH:mm")}
                    />
                    <CardItem header bordered style={{ backgroundColor: "#bbb" }}>
                        <Text> Assigned Members</Text>
                    </CardItem>
                    {taskInfo.technicians.length < 1 &&
                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                        </CardItem>}
                    {
                        taskInfo.technicians.map((l, i) => (
                            <ListItem
                                key={i}
                                leftAvatar={{ source: !!l && !!l.profileImage ? { uri: l.profileImage.cloudImage } : userDefault }}
                                title={!!l.name ? l.name + "(" + l.username + ")" : l.username}
                                subtitle={l.email}
                                rightTitle={l.confirmed ? ("Confirmed") : ("Not confirmed")}
                                rightElement={loggedInfo.role !== "technicians" && <Button
                                    color={Color.danger}
                                    title="revoke "
                                    onPress={() => { revokeHandler(taskInfo._id, l._id) }}
                                />}
                            />
                        ))
                    }
                    {loggedInfo.role !== "technicians" &&
                        <CardItem style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Button title="Assign Now!  " onPress={() => { setEditMember(!editMember) }} />
                        </CardItem>
                    }
                </Card>
            </Content>
            <View >

            </View>
            <Fab
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: Color.danger }}
                position="bottomRight"
                onPress={deleteTaskhandler}
            >
                <Icon name="trash" />
            </Fab>
            <Fab
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: '#5067FF' }}
                position="bottomLeft"
                onPress={editStatusHandler}
            >
                <Icon name="switch" />
            </Fab>
        </Container>
    );
};

TaskDetailScreen.navigationOptions = {
    headerTitle: 'TaskDetailScreen'
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

export default TaskDetailScreen;