import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RadioButton } from 'react-native-paper';
import {
    Container,
    Header,
    Content,
    Tab,
    Tabs,
    TabHeading,
    Icon,
    Card,
    CardItem,
    Separator,
    List,
    ListItem,
    Left,
    Body,
    Right,
    Thumbnail,
    Fab,
    Button as NButton
} from 'native-base';
import Dialog from "react-native-dialog";
import { SwipeListView } from 'react-native-swipe-list-view';
import userDefault from '../../assets/users/userDefault.png';
import Toast from 'react-native-tiny-toast';


import * as userActions from '../../store/actions/user';
import * as companyActions from '../../store/actions/company';
import Color from '../../constants/colors';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const CompanyMemberScreen = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [fabActive, setFabActive] = useState();
    const [createUser, setCreateUser] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin");
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const companies = useSelector(state => state.company.companies);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();
    const listViewData = Array(20)
        .fill("")
        .map((_, i) => ({ key: `${i}`, text: `item #${i}` }));

    const loadCompanies = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(companyActions.fetchCompany()).then(setIsRefreshing(false));
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadCompanies
        );
        return () => {
            willFocusSub.remove();
        };
    }, [loadCompanies]);

    useEffect(() => {
        setIsLoading(true);
        loadCompanies().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadCompanies]);

    const selectUserHandler = (id, role) => {
        props.navigation.navigate('Member', {
            userId: id,
            role: role
        });
    };

    const deleteUserHandler = async (id) => {
        if (loggedInfo.role === "co") {
            try {
                await dispatch(userActions.deleteUser(id)).then(Toast.show("User has been removed"))
            } catch (err) {
                Toast.show(err.message);
            }
        } else {
            Toast.show("Access Denied")
        }
    }


    const handleCreateUser = async () => {
        try {
            await dispatch(userActions.createUser(role, email))
                .then(setCreateUser(false)).then(Toast.show("User Created"));
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
                    onPress={loadCompanies}
                    color={Color.primary}
                />
            </View>
        );
    }


    if (isLoading || !!!companies) {
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
            <Content>
                <Dialog.Container visible={createUser}>
                    <Dialog.Title>Create User</Dialog.Title>
                    <Text>User Email:</Text>
                    <Dialog.Input
                        placeholder="userEmail"
                        style={{ backgroundColor: "#ccc" }}
                        onChangeText={text => setEmail(text)}
                    />
                    <Text>User Type:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <RadioButton
                            value="admins"
                            status={role === "admin" ? "checked" : "unchecked"}
                            onPress={() => { setRole("admin") }}
                        />
                        <Text>Admin</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <RadioButton
                            value="technicians"
                            status={role === "technician" ? "checked" : "unchecked"}
                            // status={checked === 'first' ? 'checked' : 'unchecked'}
                            onPress={() => { setRole("technician") }}
                        />
                        <Text>Technician</Text>
                    </View>
                    <Dialog.Button label="Cancel " onPress={() => { setCreateUser(false) }} />
                    <Dialog.Button
                        disabled={email === "" || !emailRegex.test(email.toLowerCase())}
                        label="Submit "
                        onPress={handleCreateUser} />
                </Dialog.Container>
                <ScrollView style={{ marginBottom: 50 }}>
                    <Separator bordered>
                        <Text>Owner</Text>
                    </Separator>
                    <List>
                        <SwipeListView
                            data={[companies[0].owner]}
                            renderItem={(data, rowMap) => (
                                <ListItem avatar style={styles.rowFront} key={data.item._id}>
                                    <Left style={{ marginLeft: 10 }}>
                                        <Thumbnail source={!!data.item.profileImage ? ({ uri: data.item.profileImage.cloudImage }) : userDefault} />
                                    </Left>
                                    <Body>
                                        <Text style={{ fontSize: 18, marginLeft: 5, marginBottom: 2 }}>{data.item.username}</Text>
                                        <Text>{data.item.email}</Text>
                                    </Body>
                                    <Right>
                                        <Text>Company Onwer</Text>
                                    </Right>
                                </ListItem>
                            )}
                            renderHiddenItem={(data, rowMap) => (
                                <View style={styles.rowBack} key={data.item._id}>
                                    <NButton full danger onPress={() => { deleteUserHandler(data.item._id) }} style={{ width: 75, height: "100%", marginLeft: 0 }} >
                                        <Icon active name="trash" />
                                    </NButton>
                                    <NButton full danger onPress={() => { selectUserHandler(data.item._id,"co") }} style={{ width: 75, height: "100%" }} >
                                        <Icon active name="md-information-circle-outline" />
                                    </NButton>
                                </View>
                            )}
                            rightOpenValue={-75}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </List>
                    <Separator bordered style={{ marginTop: 10 }}>
                        <Text>Admins</Text>
                    </Separator>
                    <List>
                        <SwipeListView
                            data={companies[0].admins}
                            renderItem={(data, rowMap) => (
                                <ListItem avatar style={data.item.confirmed ? styles.rowFront : styles.rowFrontUnConfirmed} key={data.item._id}>
                                    <Left style={{ marginLeft: 10 }}>
                                        <Thumbnail source={!!data.item.profileImage ? ({ uri: data.item.profileImage.cloudImage }) : userDefault} />
                                    </Left>
                                    <Body>
                                        <Text style={{ fontSize: 18, marginLeft: 5, marginBottom: 2 }}>{!!data.item.name ? data.item.name + "(" + data.item.username + ")" : data.item.username}</Text>
                                        <Text>{data.item.email}</Text>
                                    </Body>
                                    <Right>
                                        <Text>Admins</Text>
                                    </Right>
                                </ListItem>
                            )}
                            renderHiddenItem={(data, rowMap) => (
                                <View style={styles.rowBack} key={data.item._id}>
                                    <NButton full danger onPress={() => { deleteUserHandler(data.item._id) }} style={{ width: 75, height: "100%", marginLeft: 0 }} >
                                        <Icon active name="trash" />
                                    </NButton>
                                    <NButton full danger onPress={() => { selectUserHandler(data.item._id, "admins") }} style={{ width: 75, height: "100%" }} >
                                        <Icon active name="md-information-circle-outline" />
                                    </NButton>
                                </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            leftOpenValue={loggedInfo.role === "co" ? 75 : 0}
                            rightOpenValue={-75}
                        />
                    </List>
                    <Separator bordered style={{ marginTop: 10 }}>
                        <Text>Technicians</Text>
                    </Separator>
                    <List>
                        <SwipeListView
                            data={companies[0].technicians}
                            renderItem={(data, rowMap) => (
                                <ListItem avatar style={data.item.confirmed ? styles.rowFront : styles.rowFrontUnConfirmed} key={data.item._id}>
                                    <Left style={{ marginLeft: 10 }}>
                                        <Thumbnail source={!!data.item.profileImage ? ({ uri: data.item.profileImage.cloudImage }) : userDefault} />
                                    </Left>
                                    <Body>
                                        <Text style={{ fontSize: 18, marginLeft: 5, marginBottom: 2 }}>{!!data.item.name ? data.item.name + "(" + data.item.username + ")" : data.item.username}</Text>
                                        <Text>{data.item.email}</Text>
                                    </Body>
                                    <Right>
                                        <Text>Tehcnicians</Text>
                                    </Right>
                                </ListItem>
                            )}
                            renderHiddenItem={(data, rowMap) => (
                                <View style={styles.rowBack} key={data.item._id}>
                                    <NButton full danger onPress={() => { deleteUserHandler(data.item._id) }} style={{ width: 75, height: "100%", marginLeft: 0 }} >
                                        <Icon active name="trash" />
                                    </NButton>
                                    <NButton full danger onPress={() => { selectUserHandler(data.item._id,"thecnicians") }} style={{ width: 75, height: "100%" }} >
                                        <Icon active name="md-information-circle-outline" />
                                    </NButton>
                                </View>
                            )}
                            leftOpenValue={loggedInfo.role === "co" ? 75 : 0}
                            rightOpenValue={-75}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </List>
                </ScrollView >
            </Content>
            <Fab
                active={fabActive}
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: '#5067FF', position: 'absolute', }}
                position="bottomRight"
                onPress={() => {
                    setFabActive(!fabActive);
                    setCreateUser(!createUser);
                }}
            >
                <Icon name="add" />
            </Fab>
        </Container>
    );
};

CompanyMemberScreen.navigationOptions = {
    headerTitle: 'CompanyMember'
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
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
    rowFront: {
        alignItems: 'center',
        backgroundColor: "#FFF",
        justifyContent: 'center',
        flex: 1,
        marginLeft: 0
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
        backgroundColor: Colors.secondary,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});


export default CompanyMemberScreen;