import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Image } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { ListItem } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Container, Content, CardItem, Card } from 'native-base';
import { Badge } from 'react-native-paper';

import * as systemActions from '../../store/actions/system';
import * as messageActions from '../../store/actions/message';
import userDefault from '../../assets/users/userDefault.png';
import a from '../../assets/users/userDefault1.png';
import noresult from '../../assets/no-result.png';
import Color from '../../constants/colors';


const MessageDetailScreen = props => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const fetchedMessage = useSelector(state => state.message.messageById);
    const systemInfo = useSelector(state => state.system.systemInfo);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const messageId = props.navigation.getParam('messageId');


    const loadMessage = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(messageActions.fetchMessageById(messageId));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadMessage
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadMessage]);

    useEffect(() => {
        setIsLoading(true);
        loadMessage().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadMessage]);

    if (error) {
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

    if (isLoading || isRefreshing || !!!loggedInfo || !!!fetchedMessage || fetchedMessage === undefined || !!!systemInfo) {
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
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={loadMessage} />
                    }
                >
                    <Card>
                        <CardItem header bordered borderWidth={1} marginBottom={29}>
                            <Text>REPLY TO</Text>
                        </CardItem>
                        {fetchedMessage.reply.length < 1 &&
                            <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                            </CardItem>}
                        {
                            fetchedMessage.reply.map((l, i) => (
                                <ListItem
                                    key={i}
                                    leftAvatar={{ source: l.publisher && !!l.publisher.profileImage ? { uri: l.publisher.profileImage.cloudImage } : userDefault }}
                                    title={!!l.publisher ? (!!l.publisher.name ? l.publisher.name : l.publisher.username) : "Company Owner"}
                                    rightTitle={moment(new Date(l.dataAdded)).format("MM-DD HH:mm")}
                                    leftElement={<Badge>{i + 1}</Badge>}
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
                        <CardItem header bordered borderWidth={1} marginBottom={29}>
                            <Text>Mentions</Text>
                        </CardItem>
                        {!!fetchedMessage.task &&
                            <CardItem>
                                <Text>Task Content: {fetchedMessage.task.content}</Text>
                            </CardItem>
                        }
                        {!!fetchedMessage.device &&
                            <CardItem>
                                <Text>Device Name: {fetchedMessage.device.name}</Text>
                            </CardItem>
                        }
                    </Card>
                    <Card>
                        <CardItem header bordered borderWidth={1} marginBottom={29}>
                            <Text>SELECTED MESSAGE</Text>
                        </CardItem>
                        <ListItem
                            leftAvatar={{ source: { uri: fetchedMessage.publisher && !!fetchedMessage.publisher.profileImage ? fetchedMessage.publisher.profileImage.cloudImage : userDefault } }}
                            title={!!fetchedMessage.publisher ? (!!fetchedMessage.publisher.name ? fetchedMessage.publisher.name : fetchedMessage.publisher.username) : "Removed User"}
                            rightTitle={moment(new Date(fetchedMessage.dataAdded)).format("MM-DD HH:mm")}
                            rightSubtitle={<Button
                                title="Reply "
                                onPress={() => { props.navigation.navigate('Publish', { type: "reply", messageId: fetchedMessage._id, systemId: systemInfo._id }) }}
                            />}
                            subtitle={"content:    " + fetchedMessage.content}
                            onPress={() => { props.navigation.navigate('MessageDetailScreen', { messageId: fetchedMessage._id }) }}
                            bottomDivider
                        />
                    </Card>
                </ScrollView>
            </Content>
        </Container>
    );
};

MessageDetailScreen.navigationOptions = {
    headerTitle: 'MessageDetailScreen'
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

export default MessageDetailScreen;