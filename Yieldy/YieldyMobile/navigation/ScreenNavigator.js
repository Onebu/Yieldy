import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import LoginScreen from '../screens/Auth/LoginScreen';
import LoginCoScreen from '../screens/Auth/LoginCoScreen';
import LoginUserScreen from '../screens/Auth/LoginUserScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DashboardScreen from '../screens/Main/DashboardScreen';
import CompanyScreen from '../screens/Main/CompanyScreen';
import ConfigScreen from '../screens/Main/ConfigScreen';
import DeviceScreen from '../screens/Main/DeviceScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import SystemScreeen from '../screens/Main/SystemScreen';
import TaskScreen from '../screens/Main/TaskScreen';
import EditImageScreen from '../screens/Edit/EditImageScreen';
import EditCompanyScreen from '../screens/Edit/EditCompanyScreen';
import EditCompanyMemberScreen from '../screens/Edit/EditCompanyMemberScreen';
import EditDeviceScreen from '../screens/Edit/EditDeviceScreen';
import EditSystemMemberScreen from '../screens/Edit/EditSystemMemberScreen';
import EditSystemScreen from '../screens/Edit/EditSystemScreen';
import EditTaskScreen from '../screens/Edit/EditTaskScreen';
import EditTaskMemberScreen from '../screens/Edit/EditTaskMemberScreen';
import EditUserScreen from '../screens/Edit/EditUserScreen';
import PublishScreen from '../screens/Edit/PublishScreen';
import StartupScreen from '../screens/StartupScreen';
import CreateUserScreen from '../screens/Edit/CreateUserScreen';
import TaskDetailScreen from '../screens/Main/TaskDetailScreen';
import CompanyMemberScreen from '../screens/Main/CompanyMemberScreen';
import MemberScreen from '../screens/Main/MemberScreen';
import MessageScreen from '../screens/Main/MessageScreen';
import MessageDetailScreen from '../screens/Main/MessageDetailScreen';
import Color from '../constants/colors';

const defaultStackNavOptions = {

    headerStyle: {
        backgroundColor: Platform.OS === 'android' ? Color.primary : ''
    },
    HeaderBackTitleStyle: {
        fontFamily: 'open-sans',
    },
    headerTitleStyle: {
        fontFamily: 'open-sans-bold',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Color.primary,
    headerTitleAlign: 'center',
};


const LoginNavigator = createStackNavigator({
    Login: LoginScreen,
    LoginCo: LoginCoScreen,
    LoginUser: LoginUserScreen,
    Register: RegisterScreen
},
    {
        mode: 'modal',
        navigationOptions: {
            headerShown: false
        },
        defaultNavigationOptions: defaultStackNavOptions
    });


const DashBoardCO = createStackNavigator({
    Dashboard: DashboardScreen,
    Company: {
        screen: CompanyScreen
    },
    EditCompany: {
        screen: EditCompanyScreen
    },
    EditCompanyMember: {
        screen: EditCompanyMemberScreen
    },
    EditUser: {
        screen: EditUserScreen
    }
}, {
    mode: 'modal',
    defaultNavigationOptions: defaultStackNavOptions
});

const Company = createStackNavigator({
    Company: {
        screen: CompanyScreen
    },
    System: {
        screen: SystemScreeen
    },
    EditUser: {
        screen: EditUserScreen
    },
    EditSystem: {
        screen: EditSystemScreen
    },
    CreateUser: {
        screen: CreateUserScreen
    },
    EditSystemMember: {
        screen: EditSystemMemberScreen
    },
    DeviceScreen: {
        screen: DeviceScreen
    },
    EditDevice: {
        screen: EditDeviceScreen
    },
    TaskScreen: {
        screen: TaskScreen
    },
    EditTaskScreen: {
        screen: EditTaskScreen
    },
    EditTaskMember: {
        screen: EditTaskMemberScreen
    },
    Publish: {
        screen: PublishScreen
    },
    TaskDetail: {
        screen: TaskDetailScreen
    },
    CompanyMember: {
        screen: CompanyMemberScreen
    },
    Member: {
        screen: MemberScreen
    },
    MessageScreen: {
        screen: MessageScreen
    },
    MessageDetailScreen: {
        screen: MessageDetailScreen
    }
},
    {
        mode: 'modal',
        defaultNavigationOptions: defaultStackNavOptions
    });

const ProfileCO = createStackNavigator({
    Profile: {
        screen: ProfileScreen
    },
    Config: {
        screen: ConfigScreen
    },
    EditImage: {
        screen: EditImageScreen
    },
},
    {
        mode: 'modal',
        defaultNavigationOptions: defaultStackNavOptions
    });
const TabScreenConfig = {

    Dashboard: {
        screen: DashBoardCO,
        navigationOptions: {
            headerTitle: 'Dashboard',
            tabBarIcon: (tabInfo) => {
                return (<MaterialCommunityIcons name="view-dashboard-outline" size={25} color={tabInfo.tintColor} />);
            },
            tabBarColor: Color.accent_s
        }
    },
    Company: {
        screen: Company,
        navigationOptions: {
            tabBarIcon: (tabInfo) => {
                return (<MaterialCommunityIcons name="account-group" size={25} color={tabInfo.tintColor} />);
            },
            tabBarColor: Color.accent_s
        }
    },
    Profile: {
        screen: ProfileCO,
        navigationOptions: {
            headerTitle: 'My Profile',
            tabBarIcon: (tabInfo) => {
                return (<MaterialCommunityIcons name="face-profile" size={25} color={tabInfo.tintColor} />);
            },
            tabBarColor: Color.accent_s
        }
    },

};
const BottomNavigator = Platform.OS === 'android'
    ? createMaterialBottomTabNavigator(TabScreenConfig, {
        activeColor: 'white',
        shifting: true,
        navigationOptions: {
            //drawerIcon: drawerConfig => <Ionicons name={Platform.OS === 'android' ? 'md-create': 'ios-create'}  size = {23} color={drawerConfig.tintColor}/>
        },
    }) :
    createBottomTabNavigator(TabScreenConfig, {
        tabBarOptions: {
            labelStyle: {
                fontFamily: 'open-sans-bold'
            },
            activeTintColor: Color.secondary
        },
        navigationOptions: {
            //drawerIcon: drawerConfig => <Ionicons name={Platform.OS === 'android' ? 'md-create': 'ios-create'}  size = {23} color={drawerConfig.tintColor}/>
        },
    });

const MainNavigator = createSwitchNavigator({

    Startup: {
        screen: StartupScreen,
        navigationOptions: {
            drawerLabel: () => null
        },
    },
    Auth: LoginNavigator,
    MainCO: BottomNavigator
}, {
    mode: 'modal',
    navigationOptions: {
    },
});

export default createAppContainer(MainNavigator);

