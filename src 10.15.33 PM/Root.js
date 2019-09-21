import React from 'react'
import { createDrawerNavigator, createAppContainer, Header } from 'react-navigation'

import AppContainer from './AppContainer'
import DrawerComponent from './components/DrawerComponents'
import logger from 'plug_mobile/src/utils/Logging'

function getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
}

const DrawerNavigator = createDrawerNavigator({
    Home: AppContainer,
}, {
    drawerBackgroundColor: "#2C4B9F",
    contentComponent: DrawerComponent,
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: "#2C4B9F",
        },
        headerTintColor: "white",
    },
})

const DwAppContainer = createAppContainer(DrawerNavigator)
export default (props) => (
    <DwAppContainer
        screenProps={props.screenProps}
        onNavigationStateChange={(prevState, currentState, action) => {
            const currentScreen = getActiveRouteName(currentState);
            const prevScreen = getActiveRouteName(prevState);
    
            if (prevScreen !== currentScreen) {
                logger.pageChange(prevScreen, currentScreen)
            }
        }}
    >

    </DwAppContainer>
)