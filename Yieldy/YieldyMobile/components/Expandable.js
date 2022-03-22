/*Example of Expandable ListView in React Native*/
import React, { Component } from 'react';
//import react in our project
import {
    LayoutAnimation,
    StyleSheet,
    View,
    Text,
    ScrollView,
    UIManager,
    TouchableOpacity,
    Platform,
} from 'react-native';
//import basic react native components

const Expandable = props => {

    handleClick = () => {
        this.setState({
            collapse: !this.state.collapse
        })
    }
    return (
        <View>
            <TouchableHighlight onClick={this.handleClick}>
                <Text style={styles.sectionHeadingStyle}>
                    Categories
            </Text>
            </TouchableHighlight>
            {this.state.collapse ? (
                <View style={styles.navSubSectionStyle}>

                    {data.categories.map(category =>
                        <Text key={category.id} >
                            {(JSON.parse(category.name))}
                        </Text>
                    )}
                </View>)
                : (null)}
        </View>
    );

}

export default Expandable;