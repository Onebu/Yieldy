import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Button,
    Dimensions,
    SafeAreaView,
    Text,
    TouchableHighlight,
    Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import Input from '../../components/Input';
import Color from '../../constants/colors';
import * as systemActions from '../../store/actions/system';
import * as taskActions from '../../store/actions/task';
import { Container, Content, Form, Card, CardItem } from 'native-base';
import Toast from 'react-native-tiny-toast';

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


const EditTaskScreen = props => {

    const systemId = props.navigation.getParam('systemId');
    const userId = props.navigation.getParam('userId');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(null);
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const systemInfo = useSelector(state => state.system.systemInfo);
    const loggedInfo = useSelector(state => state.user.userProfile);

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            content: '',
        },
        inputValidities: {
            content: false,
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            Alert.alert('An Error Occured!', error, [{ text: 'Okay' }])
        }
    }, [error]);

    const onChange = (event, selectedDate) => {
        if (mode === "date") {
            const currentDate = selectedDate || date;
            setShow(Platform.OS === 'ios');
            setDate(currentDate);
        } else {
            const currentDate = selectedDate || time;
            setShow(Platform.OS === 'ios');
            setTime(currentDate);
        }
    };

    const showMode = currentMode => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };

    const createTaskHandler = async () => {
        try {
            await dispatch(
                taskActions.createtask(
                    formState.inputValues.content,
                    !!time ? time : date,
                    systemId,
                    loggedInfo._id
                )
            );
            props.navigation.pop();
        } catch (err) {
            Toast.show(err.message);
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
        <Container >
            <Content>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={0}
                        value={date}
                        mode={mode}
                        is24Hour={true}
                        display="default"
                        minimumDate={new Date()}
                        onChange={onChange}
                    />
                )}
                <Card>
                    <CardItem header bordered marginBottom={20} >
                        <Text>Create Task</Text>
                    </CardItem>
                    <CardItem marginBottom={20}>
                        <Text color="#ccc">Selected Time: {!!time ? moment(new Date(time)).format("MM-DD HH:mm") : moment(new Date(date)).format("MM-DD HH:mm")}</Text>
                    </CardItem>
                    <CardItem cardBody style={{ marginHorizontal: 20, marginBottom: 20, justifyContent: "space-between", flexDirection: "row" }}>
                        <Button onPress={showDatepicker} title="Select due day! " style={{ marginHorizontal: 20 }} />
                        <Button onPress={showTimepicker} title="Select due time!" />
                    </CardItem>
                    <CardItem style={{ marginBottom: 20 }}>
                        <Input
                            id="content"
                            label="Task content"
                            keyboardType='default'
                            required
                            autoCapitalize="none"
                            errorText="Please enter a valid content."
                            onInputChange={inputChangeHandler}
                            initialValue=""
                            backgroundColor="#bbb"
                        />
                    </CardItem>
                    {isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : (
                        <View style={styles.buttonContainer}>
                            {
                                formState.formIsValid ? (
                                    <TouchableHighlight
                                        style={styles.button2}
                                        underlayColor='#FFF'
                                        onPress={createTaskHandler}
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

                </Card>
            </Content>
        </Container>
    );
};

EditTaskScreen.navigationOptions = {
    headerTitle: 'EditTaskScreen'
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
        backgroundColor: Color.secondary,
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').width / 70,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    button3: {
        alignItems: 'center',
        backgroundColor: "#ccc",
        padding: Dimensions.get('window').width / 40,
        marginHorizontal: Dimensions.get('window').width / 9.8,
        marginBottom: Dimensions.get('window').height / 150,
        borderRadius: 5,
        marginTop: Dimensions.get('window').width / 40,
    },
    buttonContainer: {
        marginTop: Dimensions.get('window').height / 60,
        marginBottom: 20
    }
});

export default EditTaskScreen;