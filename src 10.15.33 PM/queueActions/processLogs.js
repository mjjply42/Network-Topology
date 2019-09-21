
import logger from '../utils/Logging'

const uploadLogs = (queue) => ({
    job: async (id, payload) => {
        try {
            const response =  await fetch('https://plug-logs.infiswift.tech/plug-mobile', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error("process_logs_upload_error")
            }

        } catch (e) {
            console.log(e)
            queue.createJob("process-logs", payload, {timeout: 20000}, false)
        }
    },
    lifeCycle: {
    }
})

export default uploadLogs