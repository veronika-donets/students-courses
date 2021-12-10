import AWS from 'aws-sdk'
import { ENVIRONMENT, getAwsFilePath } from '../helpers'
import fs from 'fs'
import { initMockBucket } from '../../test/__mock__/mockAws-S3'

export const initAWSBucket = () => {
    return new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
        Bucket: process.env.BUCKET_NAME,
    })
}

export const s3bucket =
    process.env.NODE_ENV === ENVIRONMENT.TEST ? initMockBucket() : initAWSBucket()

export const uploadToS3 = async (file, sourceId) => {
    const { path, originalname, mimetype, size } = file

    const data = fs.readFileSync(path)

    const awsPath = getAwsFilePath(sourceId, originalname)

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: awsPath,
        Body: data,
        ContentType: mimetype,
        ContentLength: size,
    }

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, data) => {
            if (err) {
                reject(err.message)
            } else {
                resolve(data)
            }
        })
    })
}

export const downloadFromS3 = (name, sourceId) => {
    const awsPath = getAwsFilePath(sourceId, name)

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: awsPath,
    }

    return new Promise((resolve, reject) => {
        s3bucket.getObject(params, (err, data) => {
            if (err) {
                reject(err.message)
            } else {
                resolve(data)
            }
        })
    })
}

export const removeFromS3 = (name, sourceId) => {
    const awsPath = getAwsFilePath(sourceId, name)

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: awsPath,
    }

    return new Promise((resolve, reject) => {
        s3bucket.deleteObject(params, (err, data) => {
            if (err) {
                reject(err.message)
            } else {
                resolve(data)
            }
        })
    })
}

export const removeFilesFromS3 = (files) => {
    return Promise.all(
        files.map(({ originalname, sourceId }) => removeFromS3(originalname, sourceId))
    )
}
