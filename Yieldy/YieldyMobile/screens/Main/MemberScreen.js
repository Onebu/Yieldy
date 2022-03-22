import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    Button,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Icon, Card, CardItem, Separator, Button as NButton } from 'native-base';

import * as userActions from '../../store/actions/user';
import userDefault from '../../assets/users/userDefault.png';
import Color from '../../constants/colors';
import Toast from 'react-native-tiny-toast';

const MemberScreen = props => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const userId = props.navigation.getParam('userId');
    const role = props.navigation.getParam("role");
    const loggedInfo = useSelector(state => state.user.userProfile);
    const userInfo = useSelector(state => state.user.fetchedUser);
    const dispatch = useDispatch();

    const loadUserInfo = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(userActions.fetchUserById(userId, role)).then(setIsRefreshing(false));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadUserInfo
        );
        return () => {
            willFocusSub.remove();
        };
    }, [loadUserInfo]);

    useEffect(() => {
        setIsLoading(true);
        loadUserInfo().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadUserInfo]);

    const resendHandler = async (username) => {
        try {
            await dispatch(userActions.resend(username))
                .then(Toast.show("Email have been sent!"));
        } catch (err) {
            Toast.show(err.message);
        }
    }


    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error.message}</Text>
                <Button
                    title="Try again"
                    onPress={loadUserInfo}
                    color={Color.primary}
                />
            </View>
        );
    }

    if (isLoading || !!!loggedInfo || !!!userInfo) {
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
            <Card >
                <CardItem header>
                    <Separator bordered><Text>Member Description</Text></Separator>
                </CardItem>
                <View style={styles.userImage}>
                    <Avatar
                        rounded
                        size="large"
                        source={!!userInfo.profileImage ? ({ uri: userInfo.profileImage.cloudImage }) : userDefault}
                    />
                </View>
                <ListItem
                    title={"User name:"}
                    rightTitle={<Text>
                        {!!userInfo.name && userInfo.name} {" "}
                        {!!!userInfo.name ?
                            userInfo.username
                            : "(" + userInfo.username + ")"
                        }
                    </Text>
                    }
                    bottomDivider
                />
                <ListItem
                    title={"Role:"}
                    rightTitle={<Text>{userInfo.role}</Text>
                    }
                    bottomDivider
                />
                <ListItem
                    title={"Email:"}
                    rightTitle={<Text>{userInfo.email}</Text>
                    }
                    bottomDivider
                />
                {!userInfo.confirmed && <CardItem style={{ backgroundColor: "#ccc" }}>
                    <Text>This user haven't been confirmed</Text>
                </CardItem>}
                {loggedInfo.role === "co" && !userInfo.confirmed && <CardItem style={styles.centeredItem}>
                    <NButton
                        warning
                        onPress={() => resendHandler(userInfo.username)}
                    >
                        <Text style={{ paddingHorizontal: 40 }} >Resend Verification email?</Text>
                    </NButton>
                </CardItem>}
            </Card>
        </Container>
    );
};

MemberScreen.navigationOptions = {
    headerTitle: 'MemberScreen'
};

const styles = StyleSheet.create({

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    userImage: {
        alignSelf: "center",
        marginBottom: 10
    },
    centeredItem: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default MemberScreen;