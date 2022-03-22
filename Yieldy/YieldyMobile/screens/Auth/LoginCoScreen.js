import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    Image,
    TouchableHighlight,
    Text
} from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-tiny-toast';
import logo from '../../assets/logo_200.png';
import { StackActions, NavigationActions } from 'react-navigation';

import Input from '../../components/AuthInput';
import Color from '../../constants/colors';
import * as authAction from '../../store/actions/auth';
import Logo from '../../components/Logo';
import Wallpaper from '../../components/Wallpaper';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {
        const updatedValues = {
            ...state.inputValues,
            [action.input]: action.value
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const LoginCoScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error === 'NOT_VERIFIED') {
            Alert.alert(
                'An Error Occured!',
                error,
                [
                    { text: 'Okay' },
                    { text: 'Verify Now', onPress: resendHandler }
                ]
            )
        } else if (error) {
            Alert.alert(
                'An Error Occured!',
                error,
                [
                    { text: 'Okay' },
                ]
            )
        }
    }, [
        error
    ]);

    const loginHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                authAction.login(
                    formState.inputValues.email,
                    formState.inputValues.password,
                    "co"
                )
            );
            setIsLoading(false);
            Toast.showSuccess('Login succed!');
            props.navigation.navigate('MainCO', {}, NavigationActions.navigate({ routeName: 'Dashboard' }))
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const resendHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                authAction.resend(
                    formState.inputValues.email,
                    "co"
                )
            );
            setIsLoading(false);
            Toast.showSuccess('Verification email sent!');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }

    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                isValid: inputValidity,
                input: inputIdentifier
            });
        },
        [dispatchFormState]
    );

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={styles.screen}
        >
            <Wallpaper>
                <Logo />
                <Input
                    id="email"
                    label="E-mail"
                    keyboardType='email-address'
                    required
                    email
                    autoCapitalize="none"
                    errorText="Please enter a valid email address."
                    onInputChange={inputChangeHandler}
                    initialValue=""
                />
                <Input
                    id="password"
                    label="Password"
                    keyboardType='default'
                    secureTextEntry
                    required
                    minLength={8}
                    autoCapitalize="none"
                    errorText="Please enter a valid password."
                    onInputChange={inputChangeHandler}
                    initialValue=""
                    returnKeyType='send'
                />
                {isLoading ? (<ActivityIndicator size='small' color={Color.primary} />) : (
                    <View style={styles.buttonContainer}>
                        <TouchableHighlight
                            style={styles.button2}
                            underlayColor='#FFF'
                            onPress={loginHandler}
                        >
                            <Text style={{ justifyContent: 'center' }}>LOGIN!</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#FFF'
                            onPress={() => {
                                props.navigation.replace({ routeName: 'Register' })
                            }}
                        >
                            <Text style={{ justifyContent: 'center' }}>Register!</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#FFF'
                            onPress={() => {
                                props.navigation.replace({ routeName: 'Login' })
                            }}
                        >
                            <Text style={{ justifyContent: 'center' }}>Back to home!</Text>
                        </TouchableHighlight>
                    </View>
                )}
            </Wallpaper>
        </KeyboardAvoidingView >
    );
};

LoginCoScreen.navigationOptions = {
    headerTitle: 'Login as Co',
    headerTransparent: true,
    headerTitleStyle: {
        color: 'white'
    }
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    buttonContainer: {
        marginTop: Dimensions.get('window').height / 60
    },
    text: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Dimensions.get('window').height / 30,
        width: '90%'
    },
    image: {
        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').height / 6,
        resizeMode: 'contain',
        overflow: 'hidden',
        margin: Dimensions.get('window').width / 10
    },
    button2: {
        alignItems: 'center',
        backgroundColor: Color.warning,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 70,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    button: {
        alignItems: 'center',
        backgroundColor: Color.info,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 30,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
});

export default LoginCoScreen;