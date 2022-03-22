import React, { useEffect, useState } from 'react';
import { Button, Image, View, Text, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { useDispatch, useSelector } from 'react-redux';

import * as userActions from '../../store/actions/user';

const EditImageScreen = props => {

    const [image, setImage] = useState(null);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user.userProfile);

    useEffect(() => {
        getPermissionAsync();
    }, [])

    useEffect(() => {
        if (error) {
            Alert.alert(
                'An Error Occured!',
                error.message,
                [
                    { text: 'Okay' },
                ]
            )
        }
    }, [
        error
    ]);
    const getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    const _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.cancelled && result.type !== "image") {
                setImage(null);
                setValid(false);
            } else if (!result.cancelled) {
                let uri = result.uri;
                let fileType = uri.substring(uri.lastIndexOf(".") + 1);
                setImage({
                    uri: uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`
                });
                console.log({
                    uri: uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`
                });
                setValid(true);
            }

            console.log(result);
        } catch (E) {
            console.log(E);
        }
    };
    const handleSubmit = async () => {
        setError(null);
        try {
            await dispatch(userActions.editImage(image.name, image, userInfo.role));
        } catch (err) {
            setError(err);
        }
    }

    if (!!!userInfo) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size='large'
                    color={Color.primary}
                />
            </View>
        );
    };


    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Pick an image from camera roll" onPress={_pickImage} />
            {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
            {!valid && <Text>Please select a valid Image*</Text>}
            <Button title="Upload Now" disabled={!valid} onPress={handleSubmit} />
        </View>
    );

}

export default EditImageScreen;