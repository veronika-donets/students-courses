import AWS from 'aws-sdk'
import { getAwsFilePath, getEnvVar } from '../helpers'
import fs from 'fs'

const s3bucket = new AWS.S3({
    accessKeyId: getEnvVar('IAM_USER_KEY'),
    secretAccessKey: getEnvVar('IAM_USER_SECRET'),
    Bucket: getEnvVar('BUCKET_NAME'),
})

export const uploadToS3 = async (file, sourceId) => {
    const { path, originalname, mimetype, size } = file

    const data = fs.readFileSync(path)

    const awsPath = getAwsFilePath(sourceId, originalname)

    const params = {
        Bucket: getEnvVar('BUCKET_NAME'),
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
        Bucket: getEnvVar('BUCKET_NAME'),
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
        Bucket: getEnvVar('BUCKET_NAME'),
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
