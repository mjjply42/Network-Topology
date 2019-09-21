import React from 'react'
import { createStackNavigator, createAppContainer } from "react-navigation";

import PlugCamera from './screens/PlugCamera'
import HomeScreen from './screens/Home'
import InstallInstructions from './screens/InstallInstructions'
import CodeScanner from './screens/QRCodeScanner'
import InspectionResults from './screens/InspectionResults'
import InstallProceed from './screens/InstallProceed'
import HeaderMenu from './components/HeaderMenu'

const AppNavigator = createStackNavigator({
    CodeScanner: {
        screen: CodeScanner
    },
    PlugHistory: {
        screen: HomeScreen
    },
    PlugCamera: {
        screen: PlugCamera
    },
    InstallInstructions: {
        screen: InstallInstructions
    },
    InstallProceed: {
        screen: InstallProceed
    },
    InspectionResults: {
        screen: InspectionResults
    }
}, {
    initialRouteName: "CodeScanner",
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: "#2C4B9F",
        },
        headerTintColor: "white",
        headerLeft: HeaderMenu
    }
})

const AppContainer = createAppContainer(AppNavigator)
export default AppContainer

