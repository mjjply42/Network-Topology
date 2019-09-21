import { Component } from 'react'
import logger from '../utils/Logging'

class ErrorHandler extends Component {
    constructor(props) {
        super(props)
    }

    componentDidCatch(error, errorInfo) {
        logger.trackEvent(`error_${error.toString()}`, {trace: errorInfo.componentStack})
    }
    
    render() {
        return this.props.children;
    }

}

export default ErrorHandler