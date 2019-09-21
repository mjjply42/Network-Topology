import React, { useState } from 'react'
import { View } from 'react-native'
import { withTheme, Headline, Text } from 'react-native-paper'
import { Button, Title } from 'react-native-paper'
import { useSelector } from 'react-redux'

import PDFView from 'react-native-view-pdf'
import base_64_pdf from '../assets/base_64_pdf'

const InstallInstructions = (props) => {
    const installPlugData = useSelector((state) => state.installPlug)
    const { plugContext } = installPlugData
    
    const [page, updatePage] = useState([0, 1])
    const { colors } = props.theme


    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.primary
            }}
        >
            <View style={{alignItems: "center"}}>
                <Title style={{color: "white"}}>Plug {plugContext.wo}-{plugContext.sn}</Title>
            </View>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Button
                    onPress={()=> {props.navigation.navigate('PlugCamera')}}
                    style={{
                        backgroundColor: "#4F65AC",
                        borderRadius: 50
                    }}
                    disabled={page[0] !== page[1]}
                    mode="contained"
                >
                    START INSPECTION
                </Button>
            </View>
            <PDFView
                onScrolled={srcoll => updatePage([srcoll, 1])}
                resource={base_64_pdf}
                resourceType="base64"
                // onPageChanged={(page, numberOfPages) => updatePage([page, numberOfPages])}
                style={{
                    flex: 9,
                    marginHorizontal: 10
                }}
                source={require('../assets/getting_started.pdf')} 
            />
        </View>
    )
}

InstallInstructions.navigationOptions = {
    title: "Installation Instructions"
}

export default withTheme(InstallInstructions)