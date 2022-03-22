import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableHighlight,
    Dimensions
} from 'react-native';

import Color from '../../constants/colors';
import logo from '../../assets/logo_200.png';
import { LinearGradient } from 'expo-linear-gradient';
import TypeWriter from 'react-native-typewriter';

const LoginScreen = props => {

    return (
        <View style={styles.container}>
            <LinearGradient
                start={{ x: 0.0, y: 0.10 }} end={{ x: 1.9, y: 1.3 }}
                locations={[0, 0.5, 0.6]}
                colors={['#23A6D5', '#E73C7E', '#EE7752']}
                style={styles.linearGradient}>
                <View style={styles.topContainer}>
                    <Text style={styles.h1}>Yieldy</Text>
                    <Text style={styles.h2}><TypeWriter typing={1}>Let's connect!</TypeWriter></Text>
                </View>
                <View style={styles.middleContainer}>
                    <Image
                        source={logo}
                        style={styles.image} />
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.LoginContainer}>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#AAA'
                            onPress={() => {
                                props.navigation.replace({ routeName: 'LoginCo' })
                            }}>
                            <Text>Company Owner?</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#AAA'
                            onPress={() => {
                                props.navigation.replace({ routeName: 'LoginUser' })
                            }}
                        >
                            <Text style={{ justifyContent: 'center' }}>Normal User?</Text>
                        </TouchableHighlight>
                    </View>
                    <TouchableHighlight
                        style={styles.button2}
                        underlayColor='#FFF'
                        onPress={() => {
                            props.navigation.replace({ routeName: 'Register' })
                        }}
                    >
                        <Text style={{ justifyContent: 'center' }}>Sign up as Company Onwer</Text>
                    </TouchableHighlight>
                </View>
            </LinearGradient>
        </View>
    );

};

LoginScreen.navigationOptions = {
    headerShown: false
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: Dimensions.get('window').width,
    },
    h1: {
        color: Color.link,
        fontSize: Dimensions.get('window').width / 8,
    },
    h2: {
        color: Color.danger,
        fontSize: Dimensions.get('window').width / 15,
        marginTop: Dimensions.get('window').width / 40,
    },
    topContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleContainer: {
        flex: 3,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 4,
        justifyContent: 'flex-end',
        width: Dimensions.get('window').width * 0.9,
        margin: Dimensions.get('window').width / 20,
        padding: Dimensions.get('window').width / 30,
    },
    buttonContainer: {
        borderRadius: 5,
        padding: Dimensions.get('window').width / 50,
        marginBottom: Dimensions.get('window').width / 30,
        justifyContent: 'space-between',
    },
    LoginContainer: {
        padding: 2,
        margin: Dimensions.get('window').width / 40,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    image: {
        width: Dimensions.get('window').width / 1.4,
        height: Dimensions.get('window').height / 3,
        justifyContent: 'center',
        resizeMode: 'contain'
    },
    button: {
        alignItems: 'center',
        backgroundColor: Color.content,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 13,
        borderRadius: 5
    },
    button2: {
        alignItems: 'center',
        backgroundColor: Color.warning,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 10,
        borderRadius: 5
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
});

export default LoginScreen;