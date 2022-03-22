import React from 'react';
import { Text ,View, Button} from 'react-native';
import { NavigationActions } from 'react-navigation';

const ConfigScreen = props => {

    return (
        <View>
            <Text>ConfigScreen</Text>
            <Button onPress={() => props.navigation.navigate('Login', {}, NavigationActions.navigate({ routeName: 'Login' }))} title="Go back from LoginScreen" />
        </View>
    );
};

ConfigScreen.navigationOptions = {
    headerTitle: 'Config'
};


export default ConfigScreen;