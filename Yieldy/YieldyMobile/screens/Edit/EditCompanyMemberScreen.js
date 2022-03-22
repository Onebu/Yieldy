import React from 'react';
import { Text ,View, Button} from 'react-native';
import { NavigationActions } from 'react-navigation';

const EditCompanyMemberScreen = props => {

    return (
        <View>
            <Text>EditCompanyMemberScreen</Text>
            <Button onPress={() => props.navigation.navigate('Login', {}, NavigationActions.navigate({ routeName: 'Login' }))} title="Go back from LoginScreen" />
        </View>
    );
};

EditCompanyMemberScreen.navigationOptions = {
    headerTitle: 'EditCompanyMemberScreen'
};


export default EditCompanyMemberScreen;