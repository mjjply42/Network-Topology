import React, { useState, useEffect } from 'react'
import { withNavigationFocus } from 'react-navigation'
import { RNCamera } from 'react-native-camera'
import { Dimensions, View, StyleSheet, SafeAreaView, Vibration } from 'react-native' 
import { Title } from 'react-native-paper'
import { useSelector, useDispatch } from 'react-redux'
import logger from 'plug_mobile/src/utils/Logging'

const CodeScanner = (props) => {
    const installPlugData = useSelector((state) => state.installPlug)
    const { qrCodeScanned, plugContext } = installPlugData
    const dispatch = useDispatch()

    const [scannerRef, updateScannerRef] = useState(null)

    useEffect(() => {
        if (props.isFocused) {
            dispatch({
                type: 'install-plug-reset'
            })
        }
    }, [props.isFocused])

    const onQRRead = (data) => {
        if (!qrCodeScanned) {
            Vibration.vibrate()
            logger.trackEvent("qr_code_scanned")
            const qrDataSplit = data.split(" ")
            if (qrDataSplit.length !== 4) {
                logger.trackEvent("qr_code_scanned_failed")
                return
            }
            logger.trackEvent("qr_code_scanned_passed", {data})
            const woSNsplit = qrDataSplit[1].split("-")
    
            dispatch({
                type: 'install-plug-plug-data',
                data: {
                    partNumber: qrDataSplit[0],
                    wo: woSNsplit[0],
                    sn: woSNsplit[1],
                    po: qrDataSplit[2],
                    date: qrDataSplit[3]
                }
            })
    
            setTimeout(() => props.navigation.navigate('PlugHistory'), 2000)
        }
    }

    return (
        <>
            <RNCamera
                captureAudio={false}
                ref={updateScannerRef}
                onBarCodeRead={({data}) => onQRRead(data)}
                barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                style={{
                    // height: Dimensions.get('window').height
                    flex: 1
                }}
            >
            </RNCamera>
            <View style={styles.overlayContainer}>
                <SafeAreaView style={styles.topOrBottom}>
                    <Title style={styles.topText}>{!qrCodeScanned ? "Scan a Plug QR Code to begin" : "Scan Complete"} </Title>
                </SafeAreaView>
                <View style={styles.middle}>
                    <View style={styles.leftOrRight}></View>
                    <View 
                        style={{
                            ...styles.center,
                            borderColor: !qrCodeScanned ? "white" : "#00B912"
                        }} 
                    />
                    <View style={styles.leftOrRight}></View>
                </View>
                <SafeAreaView style={{...styles.topOrBottom, justifyContent: "flex-end"}}>
                    {qrCodeScanned &&
                        <>
                            <Title style={styles.qrResultText}>Part# {plugContext.partNumber}</Title>
                            <Title style={styles.qrResultText}>WO {plugContext.wo} - SN {plugContext.sn}</Title>
                            <Title style={styles.qrResultText}>PO# {plugContext.po}</Title>
                            <Title style={styles.qrResultText}>{plugContext.date}</Title>
                        </>
                    }
                </SafeAreaView>
            </View>
        </>

    )
}

const skrimBackground = 'rgba(0, 0, 0, .8)'
const styles = StyleSheet.create({
    overlayContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
    },
    topOrBottom: {
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: skrimBackground
    },
    middle: {
        height: Dimensions.get('window').width * .55,
        flexDirection: "row"
    },
    leftOrRight: {
        flex: 1,
        backgroundColor: skrimBackground
    },
    center: {
        width: Dimensions.get('window').width * .55,
        borderColor: "white",
        borderWidth: 4
    },
    topText: {
        color: "white"
    },
    qrResultText: {
        color: "white"
    }
})

CodeScanner.navigationOptions = {
    title: "Plug Validator"
}

export default withNavigationFocus(CodeScanner)