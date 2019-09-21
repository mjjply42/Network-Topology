import React, { useState, useEffect } from 'react'
import { Text, View, SafeAreaView, Image, StyleSheet } from 'react-native'
import VersionNumber from 'react-native-version-number';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Divider, List } from 'react-native-paper' 
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import RNFS from 'react-native-fs'
import DoubleClick from 'react-native-double-tap'

const DrawerComponents = (props) => {
    const { navigation, screenProps } = props
    const uploadQueue = screenProps.uploadQueue
    
    const [jobsLeft, updateJobsLeft] = useState(0)
    const [photosLeft, updatePhotosLeft] = useState(0)
    const [showActivity, updateShowActivity] = useState(false)

    const calculateJobsLeft = async () => {
        if (uploadQueue) {
            const jobs = await uploadQueue.getJobs()
            const jobsArray = Object.keys(jobs).map(a => jobs[a]).filter(a => a.name === "upload-photo")
            updateJobsLeft(jobsArray.length)
        }

        const images = await RNFS.readDir(RNFS.CachesDirectoryPath)
        const filteredImages = images.map(i => i.path).filter(i => i.indexOf('plug_image') > -1 && i.indexOf('jpg') > 0)
        updatePhotosLeft(filteredImages.length)
    }

    calculateJobsLeft().then()

    return (
        <SafeAreaView style={{
            flex: 1
        }}>
            <View style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Image 
                    style={{
                        height: 100,
                        flex: 3,
                        resizeMode: "contain"
                    }}
                    source={require('plug_mobile/src/img/drawer_plug.png')}/>
                <View
                    style={{
                        flex: 5,
                        alignItems: "center",
                        marginRight: 50
                    }}
                >
                    <Text style={{
                        fontSize: 24,
                        color: "white"
                    }}>PLUG VALIDATOR</Text>
                    <Text
                        style={{
                            color: "white",
                            alignSelf: "flex-end"
                        }}
                    >
                        v{VersionNumber.appVersion} | Build {VersionNumber.buildVersion}
                    </Text>

                </View>
            </View>
            <Divider 
                style={{
                    backgroundColor: "white",
                    height: 3
                }}
            />
            <View style={{
                flex: 5,
            }}>
                <List.Item
                    titleStyle={styles.whiteText}
                    onPress={() => {
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'CodeScanner' })],
                        })
                
                        props.navigation.dispatch(resetAction)
                    }}
                    title="Scan" 
                    left={props => <List.Icon {...props} icon={({color, size}) => <Icon name="qrcode" color="white" size={size}/>}/>}
                />
                <DoubleClick
                    doubleTap={() => updateShowActivity(!showActivity)}
                >
                    <List.Item 
                        titleStyle={{color: "gray"}}
                        title="Activity"
                        left={props => <List.Icon {...props} color="gray" icon="hourglass-empty" />}
                    />
                </DoubleClick>
                {showActivity && 
                    <View style={{width: "100%", paddingLeft: 25}}>
                        <Text style={styles.whiteText}>Uploads remaining: {jobsLeft}</Text>
                        <Text style={styles.whiteText}>Photos remaining: {photosLeft}</Text>
                    </View>
                }
                <List.Item 
                    titleStyle={{color: "gray"}}
                    title="Settings"
                    left={props => <List.Icon {...props} color="gray" icon="settings" />}
                />
            </View>
        </SafeAreaView>
    )  
}

const styles = StyleSheet.create({
    whiteText: {
        color: "white"
    }
})

export default withNavigation(DrawerComponents)