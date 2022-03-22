import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Image,
    Text,
    RefreshControl,
    Button
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { ListItem } from 'react-native-elements'
import { Container, Header, Content, Tab, Tabs, TabHeading, ScrollableTab, Icon, Card, Fab, CardItem, Separator, Accordion, Button as NButton } from 'native-base';
import Dialog from 'react-native-dialog';

import * as systemActions from '../../store/actions/system';
import * as companyActions from '../../store/actions/company';
import Toast from 'react-native-tiny-toast';
import Chevron from '../../components/Chevron';
import Color from '../../constants/colors';
import noresult from '../../assets/no-result.png';



const SystemTab = props => {

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [fabActive, setFabActive] = useState(false);
    const [editName, setEditName] = useState(false);
    const [name, setName] = useState("");
    const companies = useSelector(state => state.company.companies);
    const loggedInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();


    const _renderHeader = (item, expanded) => {
        return (
            <View style={{
                flexDirection: "row",
                padding: 10,
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: expanded ? Color.warning : Color.info
            }}>
                <Text style={{ fontWeight: "600" }}>
                    {" "}{item.name}
                </Text>
                {expanded
                    ? <Icon style={{ fontSize: 18 }} name="remove-circle" />
                    : <Icon style={{ fontSize: 18 }} name="add-circle" />}
            </View>
        );
    }
    const _renderContent = (item) => {
        return (
            <Card
                style={{
                    backgroundColor: "#e3f1f1",
                    padding: 10,
                    fontStyle: "italic",
                }}
            >
                <ListItem
                    title={"Name: "}
                    rightTitle={item.name}
                />
                <ListItem
                    title={"#Admins: "}
                    rightTitle={(!!item.admins && item.admins.length !== 0) ? item.admins.length : "0"}
                />
                <ListItem
                    title={"#Technicians: "}
                    rightTitle={(!!item.technicians && item.technicians.length !== 0) ? item.technicians.length : "0"}
                />
                <ListItem
                    title={"#Connected Devices: "}
                    rightTitle={(!!item.devices && item.devices.length !== 0) ? item.devices.length : "0"}
                />
                <ListItem
                    title={"#Tasks: "}
                    rightTitle={(!!item.tasks && item.tasks.length !== 0) ? item.tasks.length : "0"}
                />
                <ListItem
                    title={"More Details: "}
                    rightTitle={<Button onPress={() => { selectSystemHandler(item._id, item.name) }} title="More.." />}
                />
            </Card>
        );
    }

    const handleCreateSystem = async () => {
        try {
            await dispatch(systemActions.createSystem(name))
                .then(setEditName(false));
        } catch (err) {
            Toast.show(err.message);
        }
    }


    const selectSystemHandler = (id, name) => {
        props.navigation.navigate('System', {
            systemId: id,
            name: name
        });
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


    if (!!!companies || !!!loggedInfo) {
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
        <Container scrollEnabled style={styles.container}>
            <Dialog.Container visible={editName}>
                <Dialog.Title>Type system name in order to create a system</Dialog.Title>
                <Dialog.Input
                    style={{ backgroundColor: "#ccc" }}
                    onChangeText={text => setName(text)}
                />
                <Dialog.Button label="Cancel " onPress={() => { setEditName(false) }} />
                <Dialog.Button disabled={!!!name} label="Submit " onPress={handleCreateSystem} />
            </Dialog.Container>
            <Content>
                <Tabs renderTabBar={() => <ScrollableTab />} >
                    {companies[0].systems.map((item, i) => {
                        return <Tab heading={item.name} key={item._id}>
                            <Card
                                style={{
                                    backgroundColor: "#e3f1f1",
                                    padding: 10,
                                    fontStyle: "italic",
                                }}
                            >
                                <ListItem
                                    title={"System Name: "}
                                    rightTitle={item.name}
                                />
                                <ListItem
                                    title={"Num. of Admins: "}
                                    rightTitle={(!!item.admins && item.admins.length !== 0) ? item.admins.length : "0"}
                                />
                                <ListItem
                                    title={"Num of Technicians: "}
                                    rightTitle={(!!item.technicians && item.technicians.length !== 0) ? item.technicians.length : "0"}
                                />
                                <ListItem
                                    title={"Num of Connected Devices: "}
                                    rightTitle={(!!item.devices && item.devices.length !== 0) ? item.devices.length : "0"}
                                />
                                <ListItem
                                    title={"Tasks Created: "}
                                    rightTitle={(!!item.tasks && item.tasks.length !== 0) ? item.tasks.length : "0"}
                                />
                                <ListItem
                                    title={"More Details: "}
                                    rightTitle={<Button onPress={() => { selectSystemHandler(item._id, item.name) }} title="More.." />}
                                />
                            </Card>
                        </Tab>
                    })}
                </Tabs>
            </Content>
            <Fab
                active={fabActive}
                direction="up"
                containerStyle={{}}
                style={{ backgroundColor: '#5067FF' }}
                position="bottomRight"
                onPress={() => {
                    setFabActive(!fabActive);
                    setEditName(true);
                }}
            >
                <Icon name="add" />
            </Fab>
        </Container>
    );
};

const styles = StyleSheet.create({

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        margin: 4
    }

});

export default SystemTab;