import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { withNavigation } from 'react-navigation'

const HeaderMenu = (props) => (
    <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
        <Icon name="menu" color="white" size={25} style={{marginHorizontal: 15}} />
    </TouchableOpacity>
)

export default withNavigation(HeaderMenu)