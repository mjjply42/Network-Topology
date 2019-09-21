import Database from 'react-native-queue/config/Database'

export default resetActiveJobs = async () => {
    // Reset the jobs that react-native-queue immediately marked as "active" in realm. 
    // Else, if the user killed the app before the job finished, when the app restarts 
    // the job is still "active" so it doesn't requeue.
    // https://github.com/billmalarky/react-native-queue/issues/24
    const realm = await Database.getRealmInstance()
    realm.write(() => {
        let jobs = realm.objects('Job')
        if (jobs.length > 0) {
            for (let job of jobs) {
                job.active = false
                job.failed = null
            }
        }
    })
}