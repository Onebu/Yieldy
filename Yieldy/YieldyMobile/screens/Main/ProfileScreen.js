import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    Button,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
    RefreshControl,
    Switch,
    Alert
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Avatar, ListItem } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import userDefault from '../../assets/users/userDefault.png';

import Color from '../../constants/colors';
import * as authActions from '../../store/actions/auth';
import * as userActions from '../../store/actions/user';
import * as configActions from '../../store/actions/config';
import BaseIcon from '../../components/Icon';
import Chevron from '../../components/Chevron';
import InfoText from '../../components/InfoText';
import Dialog from "react-native-dialog";

const ProfileScreen = props => {

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const [editName, setEditName] = useState(false);
    const [name, setName] = useState("");
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user.userProfile);
    const configInfo = useSelector(state => state.config.userConfig);

    const loadProfile = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(userActions.fetchUserProfile());
            await dispatch(configActions.fetchUserConfig());
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
        if (error && error.message === "11000") {
            Alert.alert(
                'An Error Occured!',
                "Username already exists",
                [
                    { text: 'Okay' },
                ]
            )
        } else if (error) {
            Alert.alert(
                'An Error Occured!',
                error.message,
                [
                    { text: 'Okay' },
                ]
            )
        }
    }, [
        error
    ]);
    useEffect(() => {
        setIsLoading(true);
        loadProfile().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadProfile]);

    const notificationSwitchHandler = async () => {
        setError(null);
        try {
            await dispatch(
                configActions.updateConfig(configInfo._id, !configInfo.pushnotification)
            );
        } catch (err) {
            setError(err);
        }
    };

    const handeEditName = async () => {
        setError(null);
        try {
            await dispatch(userActions.updateUsername(name, userInfo.role))
                .then(setEditName(false));
        } catch (err) {
            setError(err);
        }
    }


    // if (error) {
    //     return (
    //         <View style={styles.centered}>
    //             <Text>{error}</Text>
    //             <Button
    //                 title="Try again"
    //                 onPress={loadProfile}
    //                 color={Color.primary}
    //             />
    //         </View>
    //     );
    // }

    if (isLoading || isRefreshing || !configInfo) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
            </View>
        );
    };

    if (!!!userInfo.role === "co" && !userInfo.registered) {
        return (
            <View style={styles.centered}>
                <Button title="Register your company first" onPress={() => { props.navigation.navigate('EditCompany') }}></Button>
            </View>
        );
    }


    return (
        <View>
            {userInfo ? (<ScrollView style={styles.scroll}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={loadProfile} />
                }>
                <Dialog.Container visible={editName}>
                    <Dialog.Title>Edit Username</Dialog.Title>
                    <Dialog.Input
                        style={{ backgroundColor: "#ccc" }}
                        onChangeText={text => setName(text)}
                    />
                    <Dialog.Button label="Cancel" onPress={() => { setEditName(false) }} />
                    <Dialog.Button label="Sumit" onPress={handeEditName} />
                </Dialog.Container>
                <View style={styles.userRow}>
                    <View style={styles.userImage}>
                        <Avatar
                            rounded
                            size="large"
                            source={!!userInfo.profileImage ? ({ uri: userInfo.profileImage.cloudImage }) : userDefault}
                        />
                    </View>
                    <View>
                        <Text style={{ fontSize: 16 }}>
                            {!!userInfo.name && userInfo.name}
                            {!!!userInfo.name ?
                                userInfo.username
                                : "(" + userInfo.username + ")"
                            }
                        </Text>
                        <Text
                            style={{
                                color: 'gray',
                                fontSize: 16,
                            }}
                        >
                            {userInfo.email}
                        </Text>
                    </View>
                </View>
                <InfoText text="Account" />
                <View>
                    <ListItem
                        hideChevron
                        title="Push Notifications"
                        containerStyle={styles.listItemContainer}
                        rightElement={
                            <Switch
                                onValueChange={notificationSwitchHandler}
                                value={configInfo.pushnotification}
                            />
                        }
                        leftIcon={
                            <BaseIcon
                                containerStyle={{
                                    backgroundColor: '#FFADF2',
                                }}
                                icon={{
                                    type: 'material',
                                    name: 'notifications',
                                }}
                            />
                        }
                    />
                    <ListItem
                        title="Account Type"
                        rightTitle={userInfo.role === "co" ? "Company Owner" : userInfo.role}
                        rightTitleStyle={{ fontSize: 15 }}
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#FAD291' }}
                                icon={{
                                    type: 'font-awesome',
                                    name: 'money',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Company"
                        rightTitle={userInfo.company[0].name}
                        rightTitleStyle={{ fontSize: 15 }}
                        onPress={() => { props.navigation.navigate({ routeName: 'Company' }) }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#FEA8A1' }}
                                icon={{
                                    type: 'material',
                                    name: 'language',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />

                    <ListItem
                        title="Edit username"
                        rightTitleStyle={{ fontSize: 15 }}
                        onPress={() => { setEditName(true) }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#FEA8A1' }}
                                icon={{
                                    type: 'material',
                                    name: 'edit',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Change profile"
                        rightTitleStyle={{ fontSize: 15 }}
                        onPress={() => {
                            // props.navigation.navigate('EditImage')
                        }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#FEA8A1' }}
                                icon={{
                                    type: 'material',
                                    name: 'face',
                                }}
                            />
                        }
                        rightIcon={<Text>Available at web ver.</Text>}
                    />
                </View>
                <InfoText text="More" />
                <View>
                    <ListItem
                        title="About US"
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#A4C8F0' }}
                                icon={{
                                    type: 'ionicon',
                                    name: 'md-information-circle',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Terms and Policies"
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{ backgroundColor: '#C6C7C6' }}
                                icon={{
                                    type: 'entypo',
                                    name: 'light-bulb',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Share our App"
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{
                                    backgroundColor: '#C47EFF',
                                }}
                                icon={{
                                    type: 'entypo',
                                    name: 'share',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Rate Us"
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        badge={{
                            value: 5,
                            textStyle: { color: 'white' },
                            containerStyle: { backgroundColor: 'gray', marginTop: 0 },
                        }}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{
                                    backgroundColor: '#FECE44',
                                }}
                                icon={{
                                    type: 'entypo',
                                    name: 'star',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                    <ListItem
                        title="Send FeedBack"
                        onPress={() => { }}
                        containerStyle={styles.listItemContainer}
                        leftIcon={
                            <BaseIcon
                                containerStyle={{
                                    backgroundColor: '#00C001',
                                }}
                                icon={{
                                    type: 'materialicon',
                                    name: 'feedback',
                                }}
                            />
                        }
                        rightIcon={<Chevron />}
                    />
                </View>
                <InfoText text="" />
                <ListItem
                    title="Logout"
                    onPress={() => {
                        dispatch(authActions.deleteToken());
                        dispatch(authActions.logout());
                        props.navigation.navigate('Login', {}, NavigationActions.navigate({ routeName: 'Login' }))
                    }}
                    containerStyle={styles.listItemContainer}
                    leftIcon={
                        <BaseIcon
                            containerStyle={{
                                backgroundColor: '#FF0201',
                            }}
                            icon={{
                                type: 'material',
                                name: 'exit-to-app',
                            }}
                        />
                    }
                    rightIcon={<Chevron />}
                />
            </ScrollView>) : (<View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
                <Button
                    title="Refresh"
                    onPress={loadProfile}>

                </Button>
            </View>)}
        </View>
    );
};

ProfileScreen.navigationOptions = ({ navigation }) => {
    return {
        headerTitle: 'Profile',
    }
};

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: 'white',
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

export default ProfileScreen;