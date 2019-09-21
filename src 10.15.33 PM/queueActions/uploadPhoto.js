import RNFS from 'react-native-fs'
import logger from '../utils/Logging'

const uploadPhoto = (queue) => ({
    job: async (id, payload) => {
        logger.trackEvent('upload_photo_started', {id})

        try {
            console.warn("running for id", id)
            console.log('upload photo data from queue', payload)
            const payload_copy = JSON.parse(JSON.stringify(payload))
            const {url, fetchData, user_name} = payload_copy
            const { imageData, formObj } = fetchData.body

            const formData = createFormData(imageData, formObj)
            formData.append('user', JSON.stringify({user_name}))
    
            fetchData.body = formData
        
            const fileExists = await RNFS.exists(imageData.uri)
            if (!fileExists) {
                logger.trackEvent('error_upload_photo_file_noexist', {id})
                return
            }
    
            const response = await fetch(url, fetchData)
            console.warn(response)
            if (response.status !== 200) {
                logger.trackEvent('error_upload_photo_response_code', {id, stats: response.status})
                logger.trackEvent('error_upload_photo_failed', {id})
                throw 'upload_error'
            } else {
                logger.trackEvent('upload_photo_uploaded', {id})
                logger.trackEvent('upload_photo_file_deleted', {id})
                await RNFS.unlink(imageData.uri)
    
                logger.trackEvent('upload_photo_finished', {id})
                return
            }
        } catch (e) {
            logger.trackEvent('error_upload_photo_failed', {id})
            logger.trackEvent('error_upload_photo', {id})
            logger.trackEvent(`error_upload_photo_${e.toString()}`, {id})
            console.log('upload photo data to queue', payload)
            queue.createJob('upload-photo', payload, {timeout: 20000}, false)
            console.warn(e)
        }
    },
    lifeCycle: {
    }
})


const createFormData = (photo, body) => {
    const data = new FormData();
  
    data.append("image", {
        name: 'imageToUpload.jpeg',
        type: 'image/jpeg',
        uri: photo.uri
    });

    data.append("meta", JSON.stringify(body))
    return data;
}

export default uploadPhoto