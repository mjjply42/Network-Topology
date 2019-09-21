import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { withNavigationFocus } from 'react-navigation'
import { RNCamera } from 'react-native-camera'
import { StyleSheet, View, SafeAreaView, Dimensions, TouchableOpacity, ImageBackground } from 'react-native'
import { Title } from 'react-native-paper'
import { useSelector, useDispatch } from 'react-redux'
import CameraRoll from "@react-native-community/cameraroll"
import Permissions from 'react-native-permissions'
import Image from 'react-native-scalable-image';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs'

import Icon from 'react-native-vector-icons/FontAwesome'
import runModelOnImage from '../utils/tflite'
import logger from 'plug_mobile/src/utils/Logging'
import cropPlugImage from 'plug_mobile/src/utils/cropPlugImage'

const { height } = Dimensions.get('window');

const PlugCamera = (props) => {
    const dispatch = useDispatch()
    const pictureData = useSelector((state) => state.installPlug.plugImage)
    const plugContext = useSelector((state) => state.installPlug.plugContext)

    const [cameraRef, updateCameraRef] = useState(null)
    const [imageTaken, updateImageTaken] = useState(false)

    useEffect(() => {
        if (props.isFocused) updateImageTaken(false)
    }, [props.isFocused])

    const takePicture = async () => {
        logger.trackEvent('plug_camera_picture_taken')

        if (cameraRef) {
            const data = await cameraRef.takePictureAsync({
                fixOrientation: true, 
                forceUpOrientation: true,
                skipProcessing: false,
                orientation: 1
            })

            // now that we have the data from the camera the first thing we're going to do is resize it
            const resizedImage = await ImageResizer.createResizedImage(data.uri, 800, 800, "JPEG", 100)
            logger.trackEvent('upload_report_resized_image')
    
            // crop the image with the mask
            const croppedImgUri = await cropPlugImage(resizedImage.uri) 
    
            // rename the image with a prefix of plug_image
            let new_location = `${RNFS.CachesDirectoryPath}/plug_image_${plugContext.wo}_${plugContext.sn}_${(new Date).getTime()}.jpg`
            if ( Platform.OS === "android") {
                new_location = "file://" + new_location
            }
    
            await RNFS.moveFile(croppedImgUri, new_location)
            logger.trackEvent('upload_report_rename_image', {data: new_location})
    
            resizedImage.uri = new_location

            const tfData = await runModelOnImage(new_location)
            console.warn(tfData)
            dispatch({
                type: "install-plug-ml-defects",
                data: tfData.filter(value => value.confidence >= .5).map(value => parseInt(value.label)).filter(value => value > 0)
            })

            dispatch({
                type: "install-plug-plug-image-capture",
                data: {
                    uri: new_location
                }
            })

            if (Platform.OS === "android") {
                const cameraRollPermission = await Permissions.check('storage')
                if (cameraRollPermission !== 'authorized') {
                    await Permissions.request('storage')
                }
            }

            const res = await CameraRoll.saveToCameraRoll(new_location)

            updateImageTaken(data.uri)
            setTimeout(async () => {
                    // delete the old image file
                    await RNFS.unlink(data.uri)
                    logger.trackEvent('upload_report_resized_image_delete_old')
                    props.navigation.navigate('InspectionResults')
            }, 500)
        }
    }

    return (
        <View style={styles.container}>
            {!imageTaken &&
                <RNCamera
                    ref={updateCameraRef}
                    style={styles.camera}
                    captureAudio={false}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                />
            }
            {imageTaken && 
                <ImageBackground 
                    source={{uri: imageTaken}}
                    style={{width: '100%', height: '100%', flex: 1}} 
                    imageStyle={{resizeMode: "cover"}}
                />
            }
            
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.top}>
                    {/* <Title style={styles.titleText}>Align the plug as shown</Title> */}
                </View>
                <View style={styles.middle}>
                    <View style={styles.leftOrRight}></View>
                    <Image 
                        height={height * .75}
                        // style={styles.center} 
                        source={require('../img/plug_outline.png')} 
                    />
                    <View style={styles.leftOrRight}>
                        <TouchableOpacity onPress={takePicture}>
                            <View style={styles.buttonContainer}>
                                <Icon name="camera" color="white" size={27} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottom}></View>     
            </View>
        </View>
    )
}

const skrimBackground = 'rgba(0, 0, 0, .65)'
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1
    },
    top: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: skrimBackground
    },
    bottom: {
        justifyContent: "space-around",
        alignItems: "center",
        flex: 1,
        backgroundColor: skrimBackground
    },
    middle: {
        flexDirection: "row",
    },
    leftOrRight: {
        flex: 1,
        backgroundColor: skrimBackground,
        justifyContent: "space-around",
        alignItems: "center"
    },
    center: {
        resizeMode: "contain",
        width: "100%"
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        aspectRatio: 1,
        borderWidth: 3,
        borderColor: "white",
        borderRadius: 50,
        padding: 9
    },
    titleText: {
        color: "white"
    }
})

PlugCamera.navigationOptions = {
    title: "Installation Inspection"
}

export default withNavigationFocus(PlugCamera)