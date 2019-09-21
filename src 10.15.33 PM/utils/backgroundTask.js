import queueFactory from 'react-native-queue'
import logger from '../utils/Logging'

import uploadLogs from '../queueActions/processLogs'
import uploadPhoto from '../queueActions/uploadPhoto'

const backgroundTask = async () => {
    const queue = await queueFactory()
    logger.setQueue(queue)

    logger.trackEvent('background_task_started')

    const processUploadPhoto = uploadPhoto(queue)
    queue.addWorker('upload-photo', processUploadPhoto.job, processUploadPhoto.lifeCycle)

    const processLogsWorker = uploadLogs(queue)
    queue.addWorker('process-logs', processLogsWorker.job, processLogsWorker.lifeCycle)

    await queue.start(25000)
    logger.trackEvent('background_task_ended')
}

export default backgroundTask