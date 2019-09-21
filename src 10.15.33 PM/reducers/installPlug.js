const defaultState = {
    qrCodeScanned: false,
    plugContext: {
        partNumber: "",
        wo: "",
        sn: "",
        po: "",
        date: ""
    },
    plugImage: {
    },
    defects: false,
    mlDefectResults: []
}

const installPlug = (state = defaultState, action) => {
    switch (action.type) {
        case 'install-plug-plug-data':
            return {
                ...state,
                qrCodeScanned: true,
                plugContext: action.data
            }
        case 'install-plug-reset-scanner':
            return {
                ...state,
                qrCodeScanned: false
            }
        case 'install-plug-plug-image-capture':
            return {
                ...state,
                plugImage: action.data
            }
        case 'install-plug-set-defect-status':
            return {
                ...state,
                defects: action.data
            }
        case 'install-plug-ml-defects': 
            return {
                ...state,
                mlDefectResults: action.data
            }
        case 'install-plug-reset':
            return defaultState
        default:
            return state
    }
}

export default installPlug