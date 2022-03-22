import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Card, ListItem } from 'react-native-elements'
import { useSelector, useDispatch } from 'react-redux';

import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';

const EditUserScreen = props => {

    const userId = props.navigation.getParam('userId');
    const role = props.navigation.getParam('role');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user.fetchedUser);
    const coInfo = useSelector(state => state.user.fetchedCo);
    const loggedInfo = useSelector(state => state.auth.userInfo);

    const loadProfile = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            if (role === 'co') {
                await dispatch(userActions.fetchcobyid(userId));
            } else {
                await dispatch(userActions.fetchuserbyid(userId));
            }
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);



    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadProfile
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadProfile]);

    useEffect(() => {
        setIsLoading(true);
        loadProfile().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadProfile]);

    const deleteUserHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                userActions.deleteuser(userInfo._id)
            );
            props.navigation.pop();
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const resendHandler = async () => {
        setError(null);
        try {
            await dispatch(userActions.resend(userInfo.username));
        } catch (err) {
            setError(err.message);
        }
    }

    let uriImage;
    uriImage = "https://bootdey.com/img/Content/avatar/avatar6.png";
    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
                <Button
                    title="Try again"
                    onPress={loadProfile}
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

    return (
        <View flex={1}>
            {role === 'co' ?
                (<View>
                    <Card
                        title='User'>
                        <Image
                            style={styles.image}
                            source={{ uri: "https://bootdey.com/img/Content/avatar/avatar6.png" }}
                        />
                        <ListItem
                            title={"User Name: "}
                            rightTitle={coInfo.username}
                            bottomDivider
                        />
                        <ListItem
                            title={"User role: "}
                            rightTitle={coInfo.role}
                            bottomDivider
                        />
                        <ListItem
                            title={"User email: "}
                            badge={{ value: coInfo.email }}
                            bottomDivider
                        />
                    </Card>
                </View>) : (
                    <View>
                        <Card
                            title='User'>
                            <Image
                                style={styles.image}
                                source={{ uri: "https://bootdey.com/img/Content/avatar/avatar6.png" }}
                            />
                            <ListItem
                                title={"User Name: "}
                                rightTitle={userInfo.username}
                                bottomDivider
                            />
                            <ListItem
                                title={"User role: "}
                                rightTitle={userInfo.role}
                                bottomDivider
                            />
                            <ListItem
                                title={"User email: "}
                                badge={{ value: userInfo.email }}
                                bottomDivider
                            />
                            {(loggedInfo.role === 'co' && !userInfo.confirmed) ? (<Button title="resend Confirme" onPress={resendHandler}></Button>) : (null)}
                            {loggedInfo.role === 'co' ? (<Button title="remove user from company" onPress={deleteUserHandler}></Button>) : (null)}
                        </Card>
                    </View>
                )
            }
        </View >
    );
};

EditUserScreen.navigationOptions = {
    headerTitle: 'EditUserScreen'
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
    }
});

export default EditUserScreen;