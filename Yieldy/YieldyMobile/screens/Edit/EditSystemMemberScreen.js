import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Card, ListItem } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { List, Separator, CardItem, Container, Content } from 'native-base';
import Toast from 'react-native-tiny-toast';

import Chevron from '../../components/Chevron'
import Color from '../../constants/colors';
import * as userActions from '../../store/actions/user';
import * as systemActions from '../../store/actions/system';
import * as companyActions from '../../store/actions/company';
import userDefault from '../../assets/users/userDefault.png';
import noresult from '../../assets/no-result.png';

const EditSystemMemberScreen = props => {

    const systemId = props.navigation.getParam('systemId');
    const type = props.navigation.getParam('type');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const systemInfo = useSelector(state => state.system.systemInfo);
    const companies = useSelector(state => state.company.companies);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const [abledMember, setAbledMember] = useState(null);

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

    const loadCompanies = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(companyActions.fetchCompany());
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);



    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadSystem,
            loadCompanies
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadSystem, loadCompanies]);

    useEffect(() => {
        if (!!systemInfo && !!type) {
            if (type === "admin") {
                setAbledMember(companies[0].admins.filter((admin) => {
                    return !systemInfo.admins.find(({ _id }) => admin._id === _id);
                }))
            } else {
                setAbledMember(companies[0].technicians.filter(function (techn) {
                    return !systemInfo.technicians.find(({ _id }) => techn._id === _id);
                }))
            }
        }
        setIsLoading(false);
    }, [companies[0].admins, companies[0].technicians, systemInfo, type])


    useEffect(() => {
        setIsLoading(true);
        loadSystem().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadSystem, loadCompanies]);

    const assignHandler = async (systemId, userId) => {
        try {
            if (type === "admin") {
                await dispatch(
                    systemActions.assignadmin(
                        systemId,
                        userId
                    )
                );
            } else if (type === "technician") {
                await dispatch(
                    systemActions.assigntechnician(
                        systemId,
                        userId
                    )
                );
            }
        } catch (err) {
            Toast.show(err.message);
        }
    };

    const revokeHandler = async (systemId, userId) => {
        try {
            if (type === "admin") {
                await dispatch(
                    systemActions.revokeadmin(
                        systemId,
                        userId
                    )
                );
            } else if (type === "technician") {
                await dispatch(
                    systemActions.revoketechnician(
                        systemId,
                        userId
                    )
                );
            }
        } catch (err) {
            Toast.show(err.message);
        }
    };

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


    if (isLoading || !!!companies || !!!systemInfo || !!!loggedInfo) {
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
            <Content >
                <Card
                    title='System Description'>
                    <ListItem
                        title={"System Name: "}
                        rightTitle={systemInfo.name}
                        bottomDivider
                    />
                    <ListItem
                        title={"Company: "}
                        rightTitle={systemInfo.company.name}
                        bottomDivider
                    />
                </Card>
                {type === "admin" ?
                    <Card>
                        <List>
                            <ListItem
                                title="Admins"
                            />
                        </List>
                        <CardItem>
                            <Separator bordered>
                                <Text>System's Admins</Text>
                            </Separator>
                        </CardItem>
                        {systemInfo.admins.length < 1 ? <CardItem cardBody style={{ alignItems: 'center', justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                        </CardItem> :
                            <List>
                                {!!systemInfo.admins && systemInfo.admins.map(admin =>
                                    (<ListItem
                                        title={<Text>
                                            {!!admin.name && admin.name} {" "}
                                            {!!!admin.name ?
                                                admin.username
                                                : "(" + admin.username + ")"
                                            }
                                        </Text>}
                                        rightElement={<Button
                                            title="Revoke "
                                            onPress={() => {
                                                revokeHandler(systemInfo._id, admin._id)
                                            }}
                                        />}
                                    />)
                                )}
                            </List>
                        }
                        <CardItem>
                            <Separator bordered>
                                <Text>Company's Admins</Text>
                            </Separator>
                        </CardItem>
                        {abledMember.length > 0 ?
                            <List>
                                {!!abledMember && abledMember.map(admin =>
                                    (<ListItem
                                        title={<Text>
                                            {!!admin.name && admin.name} {" "}
                                            {!!!admin.name ?
                                                admin.username
                                                : "(" + admin.username + ")"
                                            }
                                        </Text>}
                                        rightElement={<Button
                                            title="Assign "
                                            onPress={() => {
                                                assignHandler(systemInfo._id, admin._id)
                                            }}
                                        />}
                                    />)
                                )}
                            </List> :
                            <CardItem cardBody style={{ alignItems: 'center', justifyContent: 'center', textAlignVertical: 'center' }}>
                                <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                            </CardItem>}
                    </Card> : <Card>
                        <List>
                            <ListItem
                                title="Admins"
                            />
                        </List>
                        <CardItem>
                            <Separator bordered>
                                <Text>System's Tehcnicians</Text>
                            </Separator>
                        </CardItem>
                        {systemInfo.technicians.length < 1 ? <CardItem cardBody style={{ alignItems: 'center', justifyContent: 'center', textAlignVertical: 'center' }}>
                            <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                        </CardItem> :
                            <List>
                                {!!systemInfo.technicians && systemInfo.technicians.map(techn =>
                                    (<ListItem
                                        title={<Text>
                                            {!!techn.name && techn.name} {" "}
                                            {!!!techn.name ?
                                                techn.username
                                                : "(" + techn.username + ")"
                                            }
                                        </Text>}
                                        rightElement={<Button
                                            title="Revoke "
                                            onPress={() => {
                                                revokeHandler(systemInfo._id, techn._id)
                                            }}
                                        />}
                                    />)
                                )}
                            </List>
                        }
                        <CardItem>
                            <Separator bordered>
                                <Text>Company's Tehcnicians</Text>
                            </Separator>
                        </CardItem>
                        {abledMember.length > 0 ?
                            <List>
                                {!!abledMember && abledMember.map(techn =>
                                    (<ListItem
                                        title={<Text>
                                            {!!techn.name && techn.name} {" "}
                                            {!!!techn.name ?
                                                techn.username
                                                : "(" + techn.username + ")"
                                            }
                                        </Text>}
                                        rightElement={<Button
                                            title="Assign "
                                            onPress={() => {
                                                assignHandler(systemInfo._id, techn._id)
                                            }}
                                        />}
                                    />)
                                )}
                            </List> :
                            <CardItem cardBody style={{ alignItems: 'center', justifyContent: 'center', textAlignVertical: 'center' }}>
                                <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                            </CardItem>}
                    </Card>
                }
            </Content>
        </Container>
    );
};

EditSystemMemberScreen.navigationOptions = {
    headerTitle: 'EditSystemMemberScreen'
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

export default EditSystemMemberScreen;