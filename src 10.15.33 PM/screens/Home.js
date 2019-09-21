import React from 'react'
import { View, Image, TouchableHighlight, StatusBar } from 'react-native'
import { withTheme, Headline, Text, Title } from 'react-native-paper'
import { useSelector } from 'react-redux'

const HomeScreen = (props) => {
    const installPlugData = useSelector((state) => state.installPlug)
    const { plugContext } = installPlugData

    const { colors } = props.theme
    const { navigation } = props

    return (
        <View
            style={{
                backgroundColor: colors.primary,
                flex: 1,
            }}
        >   
            <View style={{alignItems: "center"}}>
                <Title style={{color: "white"}}>Plug {plugContext.wo}-{plugContext.sn}</Title>
            </View>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center"
                }}
            >
                <View style={{
                    marginHorizontal: 14,
                    backgroundColor: colors.background,
                }}>
                    <TouchableHighlight onPress={() => {navigation.navigate('InstallInstructions')}}>
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: colors.background,
                            height: 120,
                            alignItems: "center",
                        }}>
                            <View
                                style={{
                                    flex: 1,
                                    paddingVertical: 30,
                                    alignItems: "center"
                                }}
                            >
                                <Image
                                    style={{
                                        resizeMode: 'contain',
                                        height: "100%",
                                        width: "100%",
                                        aspectRatio: 1
                                    }}
                                    source={require('plug_mobile/src/img/install_wrench.png')} />
                            </View>
                            <View
                                style={{
                                    flex: 2,
                                    justifyContent: "space-between",
                                }}
                            >
                                <Headline style={{color: "rgba(0, 0, 0, 0.87)"}}>Start Installation</Headline>
                                <Text style={{color: "rgba(0, 0, 0, 0.6)"}}>Prepare and mount the plug to the RIHT for installation</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>
            </View>

        </View>
    )
}

HomeScreen.navigationOptions = {
    title: "Plug History"
}

export default withTheme(HomeScreen)