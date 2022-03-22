import React, { useEffect, useState } from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    AsyncStorage
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Color from '../constants/colors';
import * as authActions from '../store/actions/auth';


const StartupScreen = props => {

    const dispatch = useDispatch();
    useEffect(() => {
        const tryLogin = async () => {
            try {
                await dispatch(authActions.authCheckState());
            } catch (error) {
                console.log(error.message);
            }
            const userData = await AsyncStorage.getItem('userInfo');
            if (!userData) {
                props.navigation.navigate('Login');
                return;
            } else {
                props.navigation.navigate('MainCO');
            }
            const transformedData = JSON.parse(userData);
        };
        tryLogin();
    }, [dispatch]);


    return (
        <View style={styles.screen}>
            <ActivityIndicator size='large' color={Color.primary} />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default StartupScreen;