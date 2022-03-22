import React from 'react'
import { Icon } from 'react-native-elements'
import  Color  from '../constants/colors'

const Chevron = () => (
  <Icon
    name="chevron-right"
    type="entypo"
    color={Color.accent}
    containerStyle={{ marginLeft: -15, width: 20 }}
  />
)

export default Chevron