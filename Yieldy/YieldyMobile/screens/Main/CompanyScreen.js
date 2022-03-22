import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Image,
    Text,
    RefreshControl,
    Button,
} from 'react-native';
import { Avatar, ListItem } from 'react-native-elements'
import { useSelector, useDispatch } from 'react-redux';
import { Container, Header, Content, Tab, Tabs, TabHeading, ScrollableTab, Icon, Card, Fab, CardItem, Separator } from 'native-base';
import Dialog from "react-native-dialog";

import Color from '../../constants/colors';
import * as companyActions from '../../store/actions/company';
import * as systemActions from '../../store/actions/system';
import Chevron from '../../components/Chevron'
import noresult from '../../assets/no-result.png';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';
import SystemTab from '../Tabs/SystemTab';

const CompanyScreen = props => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [fabActive, setFabActive] = useState(false);
    const [editName, setEditName] = useState(false);
    const [name, setName] = useState("");
    const [editCompany, setEditCompany] = useState(false);
    const companies = useSelector(state => state.company.companies);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const pushed = useSelector(state => state.system.pushed);
    const dispatch = useDispatch();
    const [companyProp, setCompanyProp] = useState('');
    const [companyValue, setCompanyValue] = useState('');
    console.disableYellowBox = true;

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

    const selectSystemHandler = (id, name) => {
        props.navigation.navigate('System', {
            systemId: id,
            name: name
        });
    };

    const updateCompany = (prop) => {
        setCompanyProp(prop);
        setEditCompany(true);
    }

    const handleCreateSystem = async () => {
        try {
            await dispatch(systemActions.createSystem(name))
                .then(setEditName(false));
        } catch (err) {
            Toast.show(err.message);
        }
    }

    const handleUpdateCompany = async () => {
        try {
            if (companyValue === '') {
                Toast.show("Please introduce some value");
            } else if (companyProp === "email") {
                await dispatch(companyActions.updateCompany(companies[0]._id, companyValue, companies[0].website, companies[0].address, companies[0].phone, companies[0].description))
                    .then(setEditCompany(false));
            } else if (companyProp === "website") {
                await dispatch(companyActions.updateCompany(companies[0]._id, companies[0].email, companyValue, companies[0].address, companies[0].phone, companies[0].description))
                    .then(setEditCompany(false));
            } else if (companyProp === "address") {
                await dispatch(companyActions.updateCompany(companies[0]._id, companies[0].email, companies[0].website, companyValue, companies[0].phone, companies[0].description))
                    .then(setEditCompany(false));
            } else if (companyProp === "phone") {
                await dispatch(companyActions.updateCompany(companies[0]._id, companies[0].email, companies[0].website, companies[0].address, companyValue, companies[0].description))
                    .then(setEditCompany(false));
            } else if (companyProp === "description") {
                await dispatch(companyActions.updateCompany(companies[0]._id, companies[0].email, companies[0].website, companies[0].address, companies[0].phone, companyValue))
                    .then(setEditCompany(false));
            }

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

    if (!isLoading && !!loggedInfo && loggedInfo.role === "co" && !loggedInfo.registered) {
        return (
            <View style={styles.centered}>
                <Button title="Register company first" onPress={() => { props.navigation.navigate('EditCompany') }}></Button>
            </View>
        );
    }



    return (
        <Container>
            <Tabs >
                <Tab heading={<TabHeading><Icon name="apps" /></TabHeading>} >
                    <Dialog.Container visible={editName}>
                        <Dialog.Title>Type system name in order to create a system</Dialog.Title>
                        <Dialog.Input
                            style={{ backgroundColor: "#ccc" }}
                            onChangeText={text => setName(text)}
                        />
                        <Dialog.Button label="Cancel " onPress={() => { setEditName(false) }} />
                        <Dialog.Button disabled={!!!name} label="Submit " onPress={handleCreateSystem} />
                    </Dialog.Container>
                    <Dialog.Container visible={editCompany}>
                        <Dialog.Title>Update {companyProp}</Dialog.Title>
                        <Dialog.Input
                            style={{ backgroundColor: "#ccc" }}
                            onChangeText={text => setCompanyValue(text)}
                        />
                        <Dialog.Button label="Cancel " onPress={() => {
                            setEditCompany(false);
                            setCompanyValue('')
                        }} />
                        <Dialog.Button disabled={!!!companyValue} label="Submit " onPress={handleUpdateCompany} />
                    </Dialog.Container>
                    <ScrollView style={styles.description}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={loadCompanies} />
                        }>
                        <Card >
                            <CardItem header>
                                <Separator bordered><Text>Company Description</Text></Separator>
                            </CardItem>
                            <ListItem
                                title={"Company Name: "}
                                rightTitle={companies[0].name}
                                bottomDivider
                            />
                            <ListItem
                                title={"Registration Date:"}
                                rightTitle={
                                    new Date(companies[0].registrationdate)
                                        .getFullYear() + "-" +
                                    (new Date(companies[0].registrationdate).getMonth() + 1) + "-" +
                                    new Date(companies[0].registrationdate).getDate()
                                }
                                bottomDivider
                            />
                            <ListItem
                                title={"Owner:"}
                                rightTitle={
                                    companies[0].owner.username
                                }
                                onPress={() => { selectUserHandler(companies[0].owner._id, companies[0].owner.role) }}
                                rightIcon={<Chevron />}
                                bottomDivider
                            />

                            <ListItem
                                title={"Contact Email: "}
                                onPress={() => {
                                    if (loggedInfo.role === "co") {
                                        updateCompany("email")
                                    }

                                }}
                                badge={{ value: !!companies[0].email ? companies[0].email : "not set" }}
                                bottomDivider
                            />
                            <ListItem
                                title={"Company Website: "}
                                onPress={() => {
                                    if (loggedInfo.role === "co") {
                                        updateCompany("website")
                                    }

                                }}
                                badge={{ value: !!companies[0].website ? companies[0].website : "not set" }}
                                bottomDivider
                            />
                            <ListItem
                                title={"Contact Phone: "}
                                onPress={() => {
                                    if (loggedInfo.role === "co") {
                                        updateCompany("phone")
                                    }

                                }}
                                badge={{ value: !!companies[0].phone ? companies[0].phone : "not set" }}
                                bottomDivider
                            />
                            <ListItem
                                title={"Address: "}
                                onPress={() => {
                                    if (loggedInfo.role === "co") {
                                        updateCompany("address")
                                    }

                                }}
                                badge={{ value: !!companies[0].address ? companies[0].address : "not set" }}
                                bottomDivider
                            />
                            {companies[0].description ? (<ListItem
                                title={"Description:"}
                                onPress={() => {
                                    if (loggedInfo.role === "co") {
                                        updateCompany("description")
                                    }

                                }}
                                subtitle={companies[0].description}
                                bottomDivider
                            />) : (
                                    <ListItem
                                        title={"Description:"}
                                        onPress={() => {
                                            if (loggedInfo.role === "co") {
                                                updateCompany("description")
                                            }

                                        }}
                                        subtitle={"There is no description about this company."}
                                        bottomDivider
                                    />
                                )}
                        </Card>
                        <Card style={{ marginBottom: 120 }}>
                            <CardItem header>
                                <Separator bordered><Text>Systems Shortcuts</Text></Separator>
                            </CardItem>
                            {companies[0].systems.length < 1 && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                                <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                            </CardItem>}
                            {companies[0].systems.length < 1 && <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginBottom: 20 }}>
                                <Text > No result was found,you may create one </Text>
                            </CardItem>}
                            {
                                companies[0].systems.map((l, i) => (
                                    <ListItem
                                        key={i}
                                        leftAvatar={{ source: { uri: "https://www.intrasoft-intl.com/sites/default/files/styles/large/public/inline-images/applicationandsystem_all.png?itok=uSgDP7xu" } }}
                                        title={"System Name: " + l.name}
                                        subtitle={l.devices.length + " Devices connected"}
                                        onPress={() => {
                                            selectSystemHandler(l._id, l.name);
                                            // selectSystemHandler(l._id, l.name) 
                                        }}
                                        bottomDivider
                                    />
                                ))
                            }
                            {loggedInfo.role === 'co' &&
                                <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginBottom: 20, marginTop: 20 }}>
                                    <Button title="Create Now!" onPress={() => { setEditName(true) }} style={{ paddingTop: 5 }} >
                                    </Button>
                                </CardItem>}
                        </Card>
                    </ScrollView>
                    <Fab
                        active={fabActive}
                        direction="up"
                        containerStyle={{}}
                        style={{ backgroundColor: '#5067FF' }}
                        position="bottomRight"
                        onPress={() => {
                            setFabActive(!fabActive)
                            props.navigation.navigate("CompanyMember")
                        }}
                    >
                        <Icon name="person" />
                    </Fab>
                </Tab>
                <Tab heading="Systems">
                    <SystemTab navigation={props.navigation} />
                </Tab>
            </Tabs>
        </Container>
    );
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
    }
});
export default CompanyScreen;