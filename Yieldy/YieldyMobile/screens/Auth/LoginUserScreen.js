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
import { StackActions, NavigationActions } from 'react-navigation';

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
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const LoginUserScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            username: '',
            password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            if(error==="NOT_VERIFIED"){
                Alert.alert(
                    'An Error Occured!',
                    "Please Contact your company owner to resend the verification email",
                    [
                        { text: 'Okay' },
                    ]
                )
            }else {
                Alert.alert(
                    'An Error Occured!',
                    error,
                    [
                        { text: 'Okay' },
                    ]
                )
            }
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
                    formState.inputValues.username,
                    formState.inputValues.password,
                    "user"
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
                            <Text style={{ justifyContent: 'center' }}>Register now as Company Onwer?</Text>
                        </TouchableHighlight>
                    </View>
                )}
            </Wallpaper>
        </KeyboardAvoidingView>
    );
};

LoginUserScreen.navigationOptions = {
    headerTitle: 'Login as user',
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
        marginBottom: Dimensions.get('window').width / 30,
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

export default LoginUserScreen;