import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Card, ListItem } from 'react-native-elements'
import { useSelector, useDispatch } from 'react-redux';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';
import * as taskActions from '../../store/actions/task';
import * as companyActions from '../../store/actions/company';

const EditTaskMemberScreen = props => {

    const taskId = props.navigation.getParam('taskId');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const taskInfo = useSelector(state => state.task.fetchedTaskById);
    const companies = useSelector(state => state.company.companies);
    const loggedInfo = useSelector(state => state.auth.userInfo);

    const loadTask = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(taskActions.fetchtaskbyid(taskId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    const loadCompanies = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(companyActions.refetchcompanyco());
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);



    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadTask,
            loadCompanies
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadTask, loadCompanies]);

    useEffect(() => {
        setIsLoading(true);
        loadTask().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadTask, loadCompanies]);

    const assignHandler = async (taskId, userId) => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                taskActions.assigntechnician(
                    taskId,
                    userId
                )
            );
            props.navigation.pop();
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
                <Button
                    title="Try again"
                    onPress={loadSystem}
                    color={Color.primary}
                />
            </View>
        );
    }

    if (isLoading || isRefreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
            </View>
        );
    };

    let uriImage;
    uriImage = "https://bootdey.com/img/Content/avatar/avatar6.png";
    return (
        <View style={styles.description}>
            <Card
                title='Task Description'>
                <ListItem
                    title={"Task status: "}
                    rightTitle={taskInfo.status}
                    bottomDivider
                />
                <ListItem
                    title={"Task content: "}
                    rightTitle={taskInfo.content}
                    bottomDivider
                />
            </Card>
            <View style={styles.content}>
                <Collapse>
                    <CollapseHeader>
                        <Text style={styles.bigblue}>Technicians</Text>
                    </CollapseHeader>
                    <CollapseBody>
                        {
                            companies[0].technicians.map((l, i) => (
                                <ListItem
                                    key={i}
                                    leftAvatar={{ source: { uri: uriImage } }}
                                    title={l.username}
                                    subtitle={l.email}
                                    rightTitle={l.confirmed ? ("Confirmed") : ("Not confirmed")}
                                    onPress={() => { assignHandler(taskInfo._id, l._id) }}
                                    bottomDivider
                                />
                            ))
                        }
                    </CollapseBody>
                </Collapse>

            </View>
        </View>
    );
};

EditTaskMemberScreen.navigationOptions = {
    headerTitle: 'EditTaskMemberScreen'
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

export default EditTaskMemberScreen;