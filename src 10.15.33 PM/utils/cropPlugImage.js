import { Image } from 'react-native'
import ImageEditor from '@react-native-community/image-editor'
import RNFS from 'react-native-fs'
import { Header } from 'react-navigation';

import logger from 'plug_mobile/src/utils/Logging'

const getImageSize = async (uri) => {
    return await new Promise((resolve, reject) => {
        Image.getSize(uri, (width, height) => resolve({width, height}), err => reject(err))
    })
}

const cropPlugImage = async (imgSourceUri) => {
    logger.trackEvent('crop_plug_start')

    // get the original image size
    const { width, height} = await getImageSize(imgSourceUri)

    // calculate the cetner of the image.
    const imgCenterWidth = width / 2
    const imgCenterHeight = height / 2

    // get the aspect ratio of the plug width / height
    const plugOutline = Image.resolveAssetSource(require('../img/plug_outline.png'))
    const PLUG_ASPECT_RATIO = plugOutline.width / plugOutline.height

    // calculate the height of the crop
    // since the plug overlay is being shown at 65%, that's the height
    // because there is a header on this page we need to calc the size of what we saw
    const cropHeight = height * 1.00
    const cropWidth = cropHeight * PLUG_ASPECT_RATIO * 1.40

    // calculate the top left corner of the image to start the crop
    const topLeftHeight = imgCenterHeight - (cropHeight / 2)
    const topLeftWidth = imgCenterWidth - (cropWidth / 2)

    // create the crop data to create the crop
    const cropData = {
        offset: {
            x: topLeftWidth,
            y: topLeftHeight
        },
        size: {
            width: cropWidth,
            height: cropHeight
        }
    }

    const croppedImageUri = await ImageEditor.cropImage(imgSourceUri, cropData)

    logger.trackEvent('crop_plug_delete_old_img')
    await RNFS.unlink(imgSourceUri)

    logger.trackEvent('crop_plug_done', {originalSize: {width, height}, cropSize: {width: cropWidth, height: cropHeight}})
    return croppedImageUri
}

export default cropPlugImage