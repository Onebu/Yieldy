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

import Input from '../../components/Input';
import Color from '../../constants/colors';
import * as systemActions from '../../store/actions/system';
import * as deviceActions from '../../store/actions/device';

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


const EditDeviceScreen = props => {

    const systemId = props.navigation.getParam('systemId');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            type: '',
            name: '',
        },
        inputValidities: {
            type: false,
            name: false,
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            Alert.alert('An Error Occured!', error, [{ text: 'Okay' }])
        }
    }, [error]);

    const createDeviceHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                deviceActions.createdevice(
                    formState.inputValues.type,
                    formState.inputValues.name,
                    systemId
                )
            );
            props.navigation.pop();
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
            behavior="padding"
            keyboardVerticalOffset={50}
            style={styles.screen}
        >
            <SafeAreaView style={styles.text}>
                <Input
                    id="type"
                    label="device type"
                    keyboardType='default'
                    required
                    autoCapitalize="none"
                    errorText="Please enter a valid type."
                    onInputChange={inputChangeHandler}
                    initialValue=""
                />
                <Input
                    id="name"
                    label="device name"
                    keyboardType='default'
                    required
                    autoCapitalize="none"
                    errorText="Please enter a valid name."
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
                                    onPress={createDeviceHandler}
                                >
                                    <Text style={{ justifyContent: 'center' }}>Create</Text>
                                </TouchableHighlight>
                            ) : (
                                    <TouchableHighlight
                                        style={styles.button3}
                                        underlayColor='#FFF'
                                    >
                                        <Text style={{ justifyContent: 'center' }}>Create</Text>
                                    </TouchableHighlight>
                                )
                        }
                    </View>)}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

EditDeviceScreen.navigationOptions = {
    headerTitle: 'EditDeviceScreen'
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Color.tertiary,
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
        backgroundColor: Color.tertiary,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 70,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    button: {
        alignItems: 'center',
        backgroundColor: Color.accent_s,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 70,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    button3: {
        alignItems: 'center',
        backgroundColor: Color.secondary,
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

export default EditDeviceScreen;