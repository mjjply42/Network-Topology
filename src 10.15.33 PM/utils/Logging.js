import DeviceInfo from 'react-native-device-info'

class Logger {
    constructor() {
        this.queue = false
        this.events = []

        this.baseObj = {
            timestamp: new Date().toISOString(),
            brand: DeviceInfo.getBrand(),
            deviceName: DeviceInfo.getDeviceName(),
            manufacturer: DeviceInfo.getManufacturer(),
            model: DeviceInfo.getDeviceId(),
            systemVersion: DeviceInfo.getSystemVersion(),
            version: DeviceInfo.getVersion(),
            buildNumber: DeviceInfo.getBuildNumber(),
            event: "",
            currentPage: "Home",
            prevPage: ""
        }

        this.windowInterval = setInterval(this.processEvents.bind(this), 10 * 1000)
    }

    processEvents() {
        // check if the internet is connected 
        if(this.events.length && this.queue) {
            this.queue.createJob('process-logs', this.events, {timeout: 20000}, true)
            this.events = []
        }
    }

    pageChange(prevPage, currentPage) {
        this.baseObj.prevPage = prevPage
        this.baseObj.currentPage = currentPage
        this.trackEvent('page_change')

    }

    trackEvent(eventName, data = {}) {
        const logObj = Object.assign({}, this.baseObj)
        logObj.timestamp = new Date().toISOString()
        logObj.event = eventName
        logObj.data = data
        this.events.push(logObj)
    }

    setQueue(queue) {
        this.queue = queue
    }
}

const logger = new Logger()

export default logger