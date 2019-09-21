import Tflite from 'tflite-react-native';
const tflite = new Tflite()

const loadModelPromise = new Promise((resolve, reject) => {
    tflite.loadModel({
        model: 'models/model.tflite',// required
        labels: 'models/labels.txt',  // required
    }, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve(res)
        }
    })
})

const runModelOnImagePromise = (imagePath) => new Promise((resolve, reject) => {
    tflite.runModelOnImage({
        path: imagePath,
        imageMean: 0.0, // defaults to 127.5
        imageStd: 255.0,  // defaults to 127.5
    }, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve(res)
        }
    })
})

const runModelOnImage = async (imagePath) => {
    await loadModelPromise
    const predictions = await runModelOnImagePromise(imagePath)
    return predictions
}

export default runModelOnImage