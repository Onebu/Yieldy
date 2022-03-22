import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { ListItem } from 'react-native-elements'
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-tiny-toast';
import moment from 'moment';
import Dialog from 'react-native-dialog';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';
import * as systemActions from '../../store/actions/system';
import * as messageActions from '../../store/actions/message';
import * as taskActions from '../../store/actions/task';
import { Content, Container, Card, CardItem, Fab, Button as NButton, Icon, Tabs, Tab, TabHeading, ScrollableTab } from 'native-base';
import noresult from '../../assets/no-result.png';

const TaskScreen = props => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const [fabActive, setFabActive] = useState(false);
    const systemInfo = useSelector(state => state.system.systemInfo);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const systemId = props.navigation.getParam('systemId');

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

    const editTaskHandler = () => {
        props.navigation.navigate('EditTaskScreen', {
            systemId: systemId,
            userId: loggedInfo._id
        });
    };

    const assignHandler = (taskId) => {
        props.navigation.navigate('EditTaskMember', {
            taskId: taskId,
        });
    };

    const selectTaskHandler = (taskId) => {
        props.navigation.navigate('TaskDetail', {
            taskId: taskId,
        });
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

    if (isLoading || isRefreshing || !!!systemInfo || !!!loggedInfo) {
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
            <Content>
                <Tabs renderTabBar={() => <ScrollableTab />} >
                    <Tab heading="WIP" >
                        <Card>
                            <CardItem style={{ backgroundColor: "#bbb" }}>
                                <Text>Work in progress:</Text>
                            </CardItem>
                            {systemInfo.tasks.filter(task => task.status === "WIP").length < 1 &&
                                <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                    <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                </CardItem>}
                            {
                                systemInfo.tasks.filter(task => task.status === "WIP").map((l, i) => (
                                    <ListItem
                                        key={i}
                                        subtitle={l.content}
                                        rightTitle={l.status}
                                        title={"Due Date: " + moment(new Date(l.duedate)).format("MM-DD HH:mm")}
                                        style={{ backgroundColor: "#ccc" }}
                                        onPress={() => { selectTaskHandler(l._id) }}
                                        onLongPress={() => { assignHandler(l._id) }}
                                        bottomDivider
                                    />
                                ))
                            }
                        </Card>
                    </Tab>
                    <Tab heading="Finished" >
                        <Card>
                            <CardItem style={{ backgroundColor: "#bbb" }}>
                                <Text>Finished:</Text>
                            </CardItem>
                            {systemInfo.tasks.filter(task => task.status !== "WIP").length < 1 &&
                                <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                    <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                                </CardItem>}
                            {
                                systemInfo.tasks.filter(task => task.status !== "WIP").map((l, i) => (
                                    <ListItem
                                        key={i}
                                        subtitle={l.content}
                                        rightTitle={l.status}
                                        title={"Due Date: " + moment(new Date(l.duedate)).format("MM-DD HH:mm")}
                                        onPress={() => { selectTaskHandler(l._id) }}
                                        onLongPress={() => { assignHandler(l._id) }}
                                        bottomDivider
                                    />
                                ))
                            }
                        </Card>
                    </Tab>

                </Tabs>
            </Content>
            {loggedInfo.role !== "technician" &&
                <Fab
                    active={fabActive}
                    direction="up"
                    containerStyle={{}}
                    style={{ backgroundColor: '#5067FF' }}
                    position="bottomRight"
                    onPress={
                        editTaskHandler
                    }
                >
                    <Icon name="create" />
                </Fab>
            }
        </Container>
    );
};

TaskScreen.navigationOptions = {
    headerTitle: 'TaskScreen'
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
        flex: 3.5,
        backgroundColor: Color.accent
    },
    content: {
        flex: 3,
        backgroundColor: Color.content
    },
});
export default TaskScreen;