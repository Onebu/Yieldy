import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import { ListItem } from 'react-native-elements'
import {
  Card,
  CardItem,
  Left,
  Right,
  Body,
  Container,
  Header,
  Content,
  Tab,
  Tabs,
  TabHeading,
  ScrollableTab,
  Fab,
  Icon
} from 'native-base';
import { LineChart, YAxis, ProgressCircle, Grid } from 'react-native-svg-charts';
import moment from 'moment';
import { NavigationActions } from 'react-navigation';

import Color from '../../constants/colors';
import * as taskActions from '../../store/actions/task';
import * as userActions from '../../store/actions/user';
import * as deviceActions from '../../store/actions/device';
import * as systemActions from '../../store/actions/system';
import noresult from '../../assets/no-result.png';

const DashboardScreen = props => {


  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const [fabActive, setFabActive] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.user.userProfile);
  const relatedDevices = useSelector(state => state.device.relatedDevices);
  const relatedTask = useSelector(state => state.task.fetchedRelated);
  const status = useSelector(state => state.device.statusList);
  const metrics = useSelector(state => state.device.metricList);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState({});
  let statusList = [];
  const contentInset = { top: 20, bottom: 20 }
  console.disableYellowBox = true;



  const loadProfile = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(userActions.fetchUserProfile());
      await dispatch(deviceActions.fetchRelatedDevice());
      await dispatch(taskActions.fetchRelatedTask());
      setIsRefreshing(false);
    } catch (err) {
      setError(err);
      setIsRefreshing(false);
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

  useEffect(() => {
    if (!!relatedDevices) {
      statusList = [];
      relatedDevices.map(device => {
        statusList.push(device.statusCode)
      })
      dispatch(deviceActions.fetchStatusList(statusList));
      dispatch(deviceActions.fetchMetricList(statusList));
    }
  }, [relatedDevices])

  useEffect(() => {
    if (!!expoPushToken) {
      AsyncStorage.setItem('pushNode', expoPushToken);
      dispatch(systemActions.addPushNode(expoPushToken))
    }
  }, [expoPushToken])


  useEffect(() => {
    registerForPushNotificationsAsync();

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    const _notificationSubscription = Notifications.addListener(_handleNotification);
  }, [])

  const _handleNotification = notification => {
    Vibration.vibrate();
    setNotification(notification);
  };


  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const existingStatus = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error.message}</Text>
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

  if (!userInfo || !!!relatedDevices || !!!status || !!!relatedTask) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size='large'
          color={Color.primary}
        />
      </View>
    );
  }

  if (!userInfo.role === "co" && !userInfo.registered) {
    return (
      <View style={styles.centered}>
        <Button title="Register company first" onPress={() => { props.navigation.navigate('EditCompany') }}></Button>
      </View>
    );
  }


  return (
    <Container enableScroll style={styles.centered}>
      <Tabs >
        <Tab heading="My Devices">
          <Content>
            <Tabs renderTabBar={() => <ScrollableTab />} >
              {!!metrics && metrics.map((metric, i) => {
                if (!!metric 
                  && metric.data.length > 0 
                  && relatedDevices.map((device)=>{
                    return device.statusCode
                  }).includes( metric.data[0]._source.fields.statuscode)) {
                  return <Tab heading={relatedDevices[i].name} key={i}>
                    {!!metric && metric.data.length > 0 ?
                      <Card bordered style={{ borderColor: Color.danger, marginBottom: 20, }} >
                        <CardItem header bordered style={{
                          backgroundColor: Color.info,
                          justifyContent: 'space-between'
                        }}>
                          <Text style={{ marginRight: 20 }}>Device Name:{' '}{relatedDevices[i].name}</Text>
                          <Button
                            style={{ marginRight: 20 }}
                            title=">>System"
                            onPress={() => {
                              props.navigation.navigate(NavigationActions.navigate({
                                routeName: 'System', params: { systemId: relatedDevices[i].system }
                              }))
                            }}
                          />
                          <Button
                            onPress={() => {
                              props.navigation.navigate(NavigationActions.navigate({
                                routeName: 'DeviceScreen', params: { deviceId: relatedDevices[i]._id }
                              }))
                            }}
                            style={{ marginLeft: 20 }}
                            title=">>Device "
                          ></Button>
                        </CardItem>
                        <ListItem
                          title={"Device Arch: "}
                          rightTitle={metric.data[0]._source.host.architecture}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device hostname: "}
                          rightTitle={metric.data[0]._source.host.hostname}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device Os family: "}
                          rightTitle={metric.data[0]._source.host.os.family}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device Os vcersion: "}
                          rightTitle={metric.data[0]._source.host.os.version}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device Os Build: "}
                          rightTitle={metric.data[0]._source.host.os.build}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device Os kernel: "}
                          rightTitle={metric.data[0]._source.host.os.kernel}
                          bottomDivider
                        />
                        <ListItem
                          title={"Device Os system: "}
                          rightTitle={metric.data[0]._source.host.os.name}
                          bottomDivider
                        />
                        <ListItem
                          title={"Last Updated: "}
                          rightTitle={moment(new Date(metric.data[0]._source["@timestamp"])).format("MM-DD HH:mm")}
                          bottomDivider
                        />
                      </Card> :
                      <Card bordered style={{ borderColor: Color.danger, marginBottom: 20, }}>
                        <CardItem header bordered style={{
                          backgroundColor: Color.info,
                          justifyContent: 'space-between'
                        }}>
                          <Text style={{ marginRight: 20 }}>Device Name:{' '}{relatedDevices[i].name}</Text>
                          <Button
                            style={{ marginRight: 20 }}
                            title=">>System"
                            onPress={() => {
                              props.navigation.navigate(NavigationActions.navigate({
                                routeName: 'System', params: { systemId: relatedDevices[i].system }
                              }))
                            }}
                          />
                          <Button
                            onPress={() => {
                              props.navigation.navigate(NavigationActions.navigate({
                                routeName: 'DeviceScreen', params: { deviceId: relatedDevices[i]._id }
                              }))
                            }}
                            style={{ marginLeft: 20 }}
                            title=">>Device "
                          ></Button>
                        </CardItem>
                        <ListItem
                          title={"Last Updated: "}
                          rightTitle={
                            <Text>No record has found, please configure beat</Text>
                          }
                          bottomDivider
                        />
                      </Card>
                    }
                  </Tab>
                }
              })}
              {/* {
                relatedDevices.map((l, i) => (
                  <Tab heading={l.name} key={i}>
                    <Card bordered style={{ borderColor: Color.danger, marginBottom: 20, }} >
                      <CardItem header bordered style={{
                        backgroundColor: Color.info,
                        justifyContent: 'space-between'
                      }}>
                        <Text style={{ marginRight: 20 }}>Device Name:{' '}{l.name}</Text>
                        <Button
                          style={{ marginRight: 20 }}
                          title=">>System"
                          onPress={() => {
                            props.navigation.navigate(NavigationActions.navigate({
                              routeName: 'System', params: { systemId: l.system }
                            }))
                          }}
                        />
                        <Button
                          onPress={() => {
                            props.navigation.navigate(NavigationActions.navigate({
                              routeName: 'DeviceScreen', params: { deviceId: l._id }
                            }))
                          }}
                          style={{ marginLeft: 20 }}
                          title=">>Device "
                        ></Button>
                      </CardItem>
                      <CardItem bordered>
                        <Body>
                          <Text>Last Updated: {' '}{l.lastUpdated ? moment(new Date(l.lastUpdated)).format("MM-DD HH:mm") : "Not Connected Yet"}</Text>
                        </Body>
                      </CardItem>
                      {status[i].data.length < 1 ?
                        <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center' }}>
                          <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
                        </CardItem> :
                        <View>
                          <CardItem header style={{ backgroundColor: "#ddd" }}>
                            <Text>Cpu usage</Text>
                          </CardItem>
                          <CardItem>
                            <Body style={{ height: 220, flexDirection: 'column', width: "100%" }}>
                              <View style={{ height: 200, flexDirection: 'row' }}>
                                <YAxis
                                  data={status[i].data.reverse().map(state => {
                                    return state.cpuusage
                                  })}
                                  contentInset={contentInset}
                                  svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                  }}
                                  numberOfTicks={10}
                                  formatLabel={(value) => `${value}%`}
                                />
                                <LineChart
                                  style={{ flex: 1, marginLeft: 16 }}
                                  data={status[i].data.map(state => {
                                    return state.cpuusage
                                  })}
                                  svg={{ stroke: 'rgb(134, 65, 244)' }}
                                  contentInset={contentInset}
                                >
                                  <Grid />
                                </LineChart>
                              </View>
                            </Body>
                          </CardItem>
                          <CardItem header style={{ backgroundColor: "#ddd" }}>
                            <Text>Mem usage</Text>
                          </CardItem>
                          <CardItem>
                            <Body
                              style={{ height: 220, flexDirection: 'column', width: "100%" }}>
                              <View style={{ height: 200, flexDirection: 'row' }}>
                                <YAxis
                                  data={status[i].data.reverse().map(state => {
                                    return state.memusage
                                  })}
                                  contentInset={contentInset}
                                  svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                  }}
                                  numberOfTicks={10}
                                  formatLabel={(value) => `${Math.floor(value * 100)}%`}
                                />
                                <LineChart
                                  style={{ flex: 1, marginLeft: 16 }}
                                  data={status[i].data.reverse().map(state => {
                                    return state.memusage
                                  })}
                                  svg={{ stroke: 'rgb(134, 65, 244)' }}
                                  contentInset={contentInset}
                                >
                                  <Grid />
                                </LineChart>
                              </View>
                            </Body>
                          </CardItem>
                        </View>}
                    </Card>
                  </Tab>
                ))
              } */}
            </Tabs>
          </Content>
          <Fab
            active={fabActive}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: Color.warning }}
            position="bottomRight"
            onPress={() => {
              loadProfile();
              setFabActive(!fabActive)
            }}
          >
            <Icon name="refresh" />
          </Fab>
        </Tab>
        <Tab heading="My Tasks">
          <Content>
            {relatedTask.length < 1 ? <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
              <CardItem cardBody style={{ alignItems: 'center', flex: 1, justifyContent: 'center', textAlignVertical: 'center', marginTop: 100 }}>
                <Image source={noresult} style={{ height: 180, width: 200, marginBottom: 20 }} />
              </CardItem>
            </View> :
              <View>
                <Card >
                  <CardItem header style={{ backgroundColor: Color.info }}>
                    <Text>Related Task progress:</Text>
                  </CardItem>
                  <ProgressCircle
                    style={{ height: 200, marginVertical: 20 }}
                    progress={relatedTask.filter(value => value.status === "done").length / relatedTask.length}
                    progressColor={'rgb(134, 65, 244)'}
                  />
                  <CardItem style={styles.centeredCard}>
                    <Text>{relatedTask.filter(value => value.status === "done").length + "/" + relatedTask.length}</Text>
                  </CardItem>
                </Card>
                <Card>
                  <CardItem header style={{ backgroundColor: Color.info }}>
                    <Text>Unfinished Tasks:</Text>
                  </CardItem>
                  {relatedTask.filter(value => value.status !== "done").map((l, i) => (
                    <CardItem key={i} style={{ backgroundColor: i % 2 === 0 ? "#ddd" : "fff" }}>
                      <Left ><Text>{l.content}</Text></Left>
                      <Right><Button
                        onPress={() => {
                          props.navigation.navigate(NavigationActions.navigate({
                            routeName: 'TaskDetail', params: { taskId: l._id }
                          }))
                        }}
                        title="Detail "
                      /></Right>
                    </CardItem>
                  ))}
                </Card>
              </View>
            }
          </Content>
          <Fab
            active={fabActive}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: Color.warning }}
            position="bottomRight"
            onPress={() => {
              loadProfile();
              setFabActive(!fabActive)
            }}
          >
            <Icon name="refresh" />
          </Fab>
        </Tab>
      </Tabs>
    </Container>

  );
};

DashboardScreen.navigationOptions = {
  headerTitle: 'Dashboard',
  headerLeft: () => null,
  gestureEnabled: false,
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centeredCard: {
    justifyContent: 'center',
    alignItems: 'center'
  },
});
export default DashboardScreen;