export const initMockBucket = () => {
    return {
        upload: (params, done) => {
            if (!params.Key.startsWith('/')) {
                done(null, 'success')
            } else {
                done({ message: 'failed' }, null)
            }
        },
        getObject: (params, done) => {
            if (!params.Key.startsWith('/')) {
                done(null, 'success')
            } else {
                done({ message: 'failed' }, null)
            }
        },
        deleteObject: (params, done) => {
            if (!params.Key.startsWith('/')) {
                done(null, 'success')
            } else {
                done({ message: 'failed' }, null)
            }
        },
    }
}
