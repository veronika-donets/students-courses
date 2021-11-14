export const initMockBucket = () => {
    //TODO
    return {
        upload: (params, callback) => {
            callback(null, 'success')
            // if (isAWScallSuccess) {
            //     callback(null, 'success')
            // } else {
            //     callback({ message: 'failed' }, null)
            // }
        },
        getObject: (params, callback) => {
            callback(null, 'success')
            // if (isAWScallSuccess) {
            //     callback(null, 'success')
            // } else {
            //     callback({ message: 'failed' }, null)
            // }
        },
        deleteObject: (params, callback) => {
            callback(null, 'success')
            // if (isAWScallSuccess) {
            //     callback(null, 'success')
            // } else {
            //     callback({ message: 'failed' }, null)
            // }
        },
    }
}
