import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    SafeAreaView,
    Text,
    TouchableHighlight,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-tiny-toast';

import Input from '../../components/AuthInput';
import Color from '../../constants/colors';
import * as authAction from '../../store/actions/auth';
import Wallpaper from '../../components/Wallpaper';
import Logo from '../../components/Logo';

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
        if (updatedValues.password !== updatedValues.repassword) {
            updatedFormIsValid = false;
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const RegisterScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            password: '',
            repassword: '',
            username: ''
        },
        inputValidities: {
            email: false,
            password: false,
            repassword: false,
            username: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            Alert.alert('An Error Occured!', error, [{ text: 'Okay' }])
        }
    }, [error]);

    const signupHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                authAction.signup(
                    formState.inputValues.username,
                    formState.inputValues.email,
                    formState.inputValues.password,
                )
            );
            Toast.showSuccess('Registration succed, an email has been sent, please confirm it.');
            props.navigation.replace({ routeName: 'Login' })
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

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
                    id="username"
                    label="Username"
                    keyboardType='default'
                    required
                    minLength={6}
                    autoCapitalize="none"
                    errorText="Please enter a valid username(Must be more than 6 letters)."
                    onInputChange={inputChangeHandler}
                    initialValue=""
                />
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
                />
                <Input
                    id="repassword"
                    label="Confirm password"
                    keyboardType='default'
                    secureTextEntry
                    required
                    minLength={8}
                    autoCapitalize="none"
                    errorText="Passwords were not the same"
                    onInputChange={inputChangeHandler}
                    initialValue=""
                />
                {isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : (
                    <View style={styles.buttonContainer}>
                        {
                            formState.formIsValid ? (
                                <TouchableHighlight
                                    style={styles.button2}
                                    underlayColor='#FFF'
                                    onPress={signupHandler}
                                >
                                    <Text style={{ justifyContent: 'center' }}>SIGN UP!</Text>
                                </TouchableHighlight>
                            ) : (
                                    <TouchableHighlight
                                        style={styles.button3}
                                        underlayColor='#FFF'
                                    >
                                        <Text style={{ justifyContent: 'center' }}>SIGN UP!</Text>
                                    </TouchableHighlight>
                                )
                        }
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#FFF'
                            onPress={() => {
                                props.navigation.replace({ routeName: 'LoginCo' })
                            }}
                        >
                            <Text style={{ justifyContent: 'center' }}>Already have an account?</Text>
                        </TouchableHighlight>
                    </View>)}
            </Wallpaper>
        </KeyboardAvoidingView>
    );
};

RegisterScreen.navigationOptions = {
    headerTitle: 'Register',
    headerTransparent: true,
    headerTitleStyle: {
        color: 'white'
    }
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Color.primary,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
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
        marginBottom: Dimensions.get('window').width / 50,
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
    button3: {
        alignItems: 'center',
        backgroundColor: Color.border,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').height / 150,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    buttonContainer: {
        marginTop: Dimensions.get('window').height / 60
    }
});

export default RegisterScreen;