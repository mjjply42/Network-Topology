import React from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import { withTheme, Title, Button } from 'react-native-paper'
import { StackActions, NavigationActions } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'

const InstallProceed = (props) => {
    const { colors } = props.theme

    const installPlugData = useSelector((state) => state.installPlug)
    const { plugContext, defects } = installPlugData

    const dispatch = useDispatch()

    const uploadAnother = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'CodeScanner' })],
        })

        props.navigation.dispatch(resetAction)
        dispatch({
            type: 'install-plug-reset'
        })
    }

    return (
        <View style={{flex: 1, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center"}}>
            <View style={styles.titleContainer}>
                <Title style={{color: "white"}}>Plug {plugContext.wo}-{plugContext.sn}</Title>
            </View>
            <View style={styles.flexContainer}>
                {!defects &&
                    <Icon name="check-circle" size={120} color="#20E800" />
                }
                {defects &&
                    <Icon name="times-circle" size={120} color="#F00000" />
                }
            </View>
            <View style={styles.flexContainer}>
                <Text style={styles.proceedText}>{defects ? "Do not proceed with RIH" : "Proceed with RIH"}</Text>
            </View>
            <View style={styles.titleContainer}>
                <Button
                    onPress={uploadAnother}
                    style={{
                        backgroundColor: "#4F65AC",
                        borderRadius: 50,
                        marginVertical: 25,
                        width: "50%"
                    }}
                    mode="contained"
                >
                    HOME
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flex: 1
    },
    flexContainer: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    proceedText: {
        width: "80%",
        color: "#fafafa",
        fontSize: 36,
        flex: 1,
        textAlign: "center"
    }
})

InstallProceed.navigationOptions = {
    title: "Inspection Results"
}

export default withTheme(InstallProceed)