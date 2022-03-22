import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Text,
    TouchableHighlight,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-tiny-toast';
import { Container, Header, Content, Form, Item, Label } from 'native-base';
import Input from '../../components/InputNativeBase';

import Color from '../../constants/colors';
import * as authAction from '../../store/actions/auth';
import * as companyAction from '../../store/actions/company';

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

const EditCompanyScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            name: '',
            website: '',
            address: '',
            phone: '',
            description: ''
        },
        inputValidities: {
            email: false,
            name: false,
            website: false,
            address: false,
            phone: false,
            description: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            Alert.alert('An Error Occured!', error, [{ text: 'Okay' }])
        }
    }, [error]);

    const createCompanyHandler = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await dispatch(
                companyAction.createCompany(
                    formState.inputValues.name,
                    formState.inputValues.email,
                    formState.inputValues.website,
                    formState.inputValues.address,
                    formState.inputValues.phone,
                    formState.inputValues.description,
                )
            );
            props.navigation.replace({ routeName: 'Dashboard' })
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
        <Container>
            <Header />
            <Content>
                <Form>
                    <Item fixedLabel>
                        <Label>Name</Label>
                        <Input
                            id="name"
                            label="name"
                            keyboardType='default'
                            required
                            minLength={6}
                            autoCapitalize="none"
                            errorText="Please enter a valid company name(Must be more than 6 letters)."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                        />
                    </Item>
                    <Item fixedLabel last>
                        <Label>Email</Label>
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
                    </Item>
                    <Item fixedLabel last>
                        <Label>Website</Label>
                        <Input
                            id="website"
                            label="website"
                            keyboardType='default'
                            required
                            minLength={6}
                            autoCapitalize="none"
                            errorText="Please enter a valid website."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                        />
                    </Item>
                    <Item fixedLabel last>
                        <Label>Address</Label>
                        <Input
                            id="address"
                            label="address"
                            keyboardType='default'
                            required
                            minLength={6}
                            autoCapitalize="none"
                            errorText="Please enter a valid address."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                        />
                    </Item>
                    <Item fixedLabel>
                        <Label>Phone</Label>
                        <Input
                            id="phone"
                            label="phone"
                            keyboardType='default'
                            required
                            minLength={6}
                            autoCapitalize="none"
                            errorText="Please enter a valid phone number."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                        />
                    </Item>
                    <Item fixedLabel>
                        <Label>Description</Label>
                        <Input
                            id="description"
                            label="description"
                            keyboardType='default'
                            required
                            minLength={5}
                            autoCapitalize="none"
                            errorText="Please enter a valid description (more than 20 letters)."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                        />
                    </Item>
                    {
                        isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : (
                            <View style={styles.buttonContainer}>
                                {
                                    formState.formIsValid ? (
                                        <TouchableHighlight
                                            style={styles.button2}
                                            underlayColor='#FFF'
                                            onPress={createCompanyHandler}
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
                            </View>)
                    }
                </Form>
            </Content>
        </Container>
    );
};

EditCompanyScreen.navigationOptions = {
    headerTitle: 'Create Company',
    headerTransparent: true,
    headerTitleStyle: {
        color: Color.primary
    }
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
        backgroundColor: Color.info,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 70,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    button: {
        alignItems: 'center',
        backgroundColor: Color.warning,
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

export default EditCompanyScreen;