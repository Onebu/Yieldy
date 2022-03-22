import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Card, ListItem } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';
import * as systemActions from '../../store/actions/system';
import * as messageActions from '../../store/actions/message';
import userDefault from '../../assets/users/userDefault.png';
import noresult from '../../assets/no-result.png';
import * as taskActions from '../../store/actions/task';
import { Container, Content, Button as NButton, Fab, Icon } from 'native-base';

const MessageScreen = props => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [fabActive, setFabActive] = useState(false);
    const dispatch = useDispatch();
    const systemInfo = useSelector(state => state.system.systemInfo);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const messages = useSelector(state => state.message.fetchedMessages);
    const systemId = props.navigation.getParam('systemId');
    const role = props.navigation.getParam('role');

    const loadScreen = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(systemActions.fetchSystemById(systemId));
            await dispatch(messageActions.fetchMessageBySystem(systemId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadScreen
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadScreen]);

    useEffect(() => {
        setIsLoading(true);
        loadScreen().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadScreen]);


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

    if (isLoading || isRefreshing || !!!loggedInfo || !!!systemInfo || !!!messages) {
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
                <ScrollView
                    style={{ marginBottom: 90 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={loadScreen} />
                    }
                >
                    {
                        messages.map((l, i) => (
                            <ListItem
                                key={i}
                                leftAvatar={{ source: l.publisher && !!l.publisher.profileImage ? { uri: l.publisher.profileImage.cloudImage } : userDefault }}
                                title={!!l.publisher ? (!!l.publisher.name ? l.publisher.name : l.publisher.username) : "Removed User"}
                                rightTitle={moment(new Date(l.dataAdded)).format("MM-DD HH:mm")}
                                rightSubtitle={<Button
                                    title="Reply "
                                    onPress={() => { props.navigation.navigate('Publish', { type: "reply", messageId: l._id, systemId: systemInfo._id }) }}
                                />}
                                subtitle={"content:    " + l.content}
                                onPress={() => { props.navigation.navigate('MessageDetailScreen', { messageId: l._id }) }}
                                bottomDivider
                            />
                        ))
                    }
                </ScrollView>
            </Content>
            <Fab
                active={fabActive}
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: '#5067FF' }}
                position="bottomRight"
                onPress={() => {
                    setFabActive(!fabActive);
                    props.navigation.navigate('Publish', { type: "publish", systemId: systemInfo._id })
                }}
            >
                <Icon name="send" />
            </Fab>
        </Container>
    );
};

MessageScreen.navigationOptions = {
    headerTitle: 'MessageScreen'
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
export default MessageScreen;