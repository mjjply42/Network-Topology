import React, { useState, useEffect } from 'react'
import { useNetInfo } from "@react-native-community/netinfo";
import { StyleSheet, View, Image, Platform, KeyboardAvoidingView, ScrollView, TextInput } from 'react-native' 
import { withTheme, Title, Card, Button, Headline, Paragraph, Text, Checkbox, Divider } from 'react-native-paper'
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceInfo from 'react-native-device-info'
import Geolocation from 'react-native-geolocation-service'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Buffer } from 'buffer'

import labelOptions from './labelOptions.json'
import config from 'plug_mobile/src/config.json'
import logger from 'plug_mobile/src/utils/Logging'

const InspectionResults = (props) => {    
    const { colors } = props.theme
    const dispatch = useDispatch()

    let [options, updateOptions] = useState(labelOptions)
    const [otherText, updateOtherText] = useState("")
    const [noDefect, updateNoDefect] = useState(true)
    const [isAccurate, updateIsAccurate] = useState(true)
    
    useEffect(() => {
        if (noDefect) {
            updateOtherText("")
        }
    }, [noDefect])

    useEffect(() => {
        if (otherText) {
            updateNoDefect(false)
        }
    }, [otherText])

    if (noDefect) {
        options = options.map(value => ({...value, selected: false}))
    }

    const { isInternetReachable } = useNetInfo()
    
    const installPlugData = useSelector((state) => state.installPlug)
    const { plugContext } = installPlugData

    const pictureData = useSelector((state) => state.installPlug.plugImage)
    const mlResults = useSelector((state) => state.installPlug.mlDefectResults)

    useEffect(() => {
        const newOptions = options.map(value => ({
            ...value,
            selected: mlResults.includes(value.value)
        }))

        updateOptions(newOptions)
        if (mlResults.length) updateNoDefect(false)
    }, [])

    const checkboxUpdateOptions = (label) => {
        const newOptions = [...options]
        const foundOption = newOptions.find(value => value.label === label)
        foundOption.selected = !foundOption.selected
        updateNoDefect(!foundOption)
        updateOptions(newOptions)
    }

    const uploadReport = async () => {
        logger.trackEvent('upload_report_starting')
        let selected = options.filter(o => o.selected).map(o => o.value)

        dispatch({
            type: 'install-plug-set-defect-status',
            data: selected.length !== 0 || otherText.length !== 0
        })

        if (selected.length == 0) {
            selected = [0]
        }

        resizedImage = {}
        resizedImage.uri = pictureData.uri
        const resizedImageUri = resizedImage.uri
        const { width, height } = await new Promise((resolve, reject) => {
            Image.getSize(resizedImageUri, (width, height) => {
                resolve({width, height})
            }, err => reject(err))
        })

        const geoPromise = new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve(position)
                },
                (err) => reject(err),
                {
                    timeout: 10000
                })
            })

        let location = {coords: {latitude: 0, longitude: 0}}
        try {
            location = await geoPromise
        } catch {
            logger.trackEvent('upload_report_location_could_not_get')
        }

        const formObj = {
            image:{
                image_res_w: width,
                image_res_h: height,
                image_mobile_defect_id: mlResults.length ? mlResults : [0],
                image_user_defect_id: isAccurate ? [] : selected,
                image_capture_time: new Date().toISOString(),
                image_location_lat: location.coords.latitude,
                image_location_lon: location.coords.longitude,
                image_user_defect_comment: otherText
            },
            plug: {
                plug_work_order: `${plugContext.wo}-${plugContext.sn}`,
                plug_part_number: plugContext.partNumber,
                plug_purchase_order: plugContext.po,
                plug_mfg_date: plugContext.date
            }
        }

        props.screenProps.uploadQueue.createJob('upload-photo', 
            {
                url: `${config.API_URL}/api/upload`,
                fetchData: {
                    method: "post",
                    body: {
                        imageData: resizedImage,
                        formObj
                    },
                    headers: {
                        'Accept': 'application/vnd.plug.v0.1',
                        'Authorization': 'Basic ' + new Buffer('slb-plug:plug9876!+').toString('base64')
                    }
                },
                user_name: DeviceInfo.getDeviceName()
            },
            {
                timeout: 20000
            }, 
            isInternetReachable
        )

        logger.trackEvent('upload_report_added_to_queue')
        props.navigation.navigate('InstallProceed') 
    }

    return (
        <KeyboardAwareScrollView enableOnAndroid={false} style={{backgroundColor: "#2C4B9F"}}>
            <View
                style={styles.container}
            >
                <Title style={{color: "white"}}>Plug {plugContext.wo}-{plugContext.sn}</Title>
                <Card style={styles.aiResultContainer}>
                    <Card.Content>
                        <View style={styles.aiResult}>
                            <View style={styles.aiResultIcon}>
                                <Icon name={noDefect ? "check-circle" : "times-circle"} size={56} color={noDefect ? "green" : "red"}/>
                            </View>
                            <View style={styles.aiResultText}>
                                <Headline>AI Inspection {noDefect ? "Passed" : "Failed"}</Headline>
                                <Paragraph>{mlResults.length ? "We found the following issues:" : "We didn't find any issues!"}</Paragraph>
                                {
                                    options.map(value => ({
                                        ...value,
                                        selected: mlResults.includes(value.value)
                                    }))
                                    .filter(value => value.selected)
                                    .map((value, index) => (
                                        <Paragraph key={`ml-results-found-${value.label}`}>{value.label}</Paragraph>
                                    ))
                                }
                            </View>
                        </View>
                        <View style={styles.accuracyContainer}>
                            <View style={styles.accuracyText}>
                                <Text>Is this accurate?</Text>
                            </View>
                            <Button mode={isAccurate ? "outlined" : "contained"} style={styles.accuracyButton} onPress={() => updateIsAccurate(false)}>No</Button>
                            <Button mode={isAccurate ? "contained" : "outlined"} style={styles.accuracyButton} onPress={() => updateIsAccurate(true)}>Yes</Button>
                        </View>
                    </Card.Content>
                </Card>
                {!isAccurate &&
                    <Card style={styles.defectReportContainer}>
                        <Card.Content style={{width: "100%", alignItems: "center"}}>
                            <Title>Plug Defect Report</Title>
                            <Text>Select all defects present on this plug:</Text>
                            <View style={{width: "100%", marginTop: 25}}>
                                <View style={styles.checkboxGroup}>
                                    <View style={styles.checkboxBox}>
                                        <Checkbox.Android
                                            status={noDefect ? "checked" : "unchecked"}
                                            color={colors.primary}
                                            onPress={() => updateNoDefect(!noDefect)}
                                        />
                                    </View>
                                    <Text style={styles.checkboxText}>No defect</Text>
                                </View>
                                <Divider style={{height: 2}}></Divider>
                                {options.map((value, index) => (
                                    <View key={`label-options-${value.label}`} style={styles.checkboxGroup}>
                                        <View style={styles.checkboxBox}>
                                            <Checkbox.Android
                                                status={value.selected ? "checked" : "unchecked"}
                                                onPress={() => {checkboxUpdateOptions(value.label)}}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text style={styles.checkboxText}>{value.label}</Text>
                                    </View>
                                ))}
                                <View style={styles.checkboxGroup}>
                                    <View style={styles.checkboxBox}>
                                        <Checkbox.Android
                                            status={otherText ? "checked" : "unchecked"}
                                            onPress={() => otherText ? updateOtherText("") : updateOtherText(" ")}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.checkboxText}>
                                        <TextInput
                                            value={otherText}
                                            placeholder="Other"
                                            mode="outlined"
                                            style={{height: 40, borderColor: "grey", borderWidth: 1, paddingHorizontal: 5}}
                                            onChangeText={updateOtherText}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                }
                <Button
                    onPress={uploadReport}
                    style={{
                        backgroundColor: "#4F65AC",
                        borderRadius: 50,
                        marginVertical: 25
                    }}
                    mode="contained"
                >
                    UPLOAD REPORT
                </Button>
            </View>
            
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#2C4B9F",
        alignItems: "center",
        padding: 15
    },
    aiResultContainer: {
        marginTop: 20,
        width: "100%",
    },
    aiResult: {
        flexDirection: "row",
    },
    aiResultIcon: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20
    },
    aiResultIconImage: {
        width: 60,
        height: 60,
        aspectRatio: 1,
        resizeMode: "contain"
    },
    aiResultText: {
        flex: 2
    },
    accuracyContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    accuracyText: {
        // flex: 5,
    },
    accuracyButton: {
        // flex: 1
    },
    defectReportContainer: {
        marginTop: 20,
        width: "100%",
        flex: 1,
        alignItems: "center"
    },
    checkboxGroup: {
        marginTop: 5,
        flexDirection: "row",
        width: "100%",
        alignItems: "center"
    },
    checkboxBox: {
        flex: 1
    },
    checkboxText: {
        flex: 3
    }
})


InspectionResults.navigationOptions = {
    title: "Inspection Results"
}

export default withTheme(InspectionResults)