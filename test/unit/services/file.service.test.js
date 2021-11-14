import { jest } from '@jest/globals'
import { File } from '../../../index'
import faker from 'faker'
import { getMockFileList } from '../__mock__/mockFile'
import {
    createUploadedFile,
    createUploadedFilesWithS3,
    getFileByIdWithSource,
    removeFiles,
    removeFilesWithS3,
} from '../../../src/services/file.service'
import { s3bucket } from '../../../src/services/aws-S3.service'
import { mockFile, randomMimetype } from '../__mock__/mockResponseData'

describe('File service testing', () => {
    const spyFileCreate = jest.spyOn(File, 'create')
    const spyFileFindOne = jest.spyOn(File, 'findOne')
    const spyFileDestroy = jest.spyOn(File, 'destroy')
    const spyUploadToS3 = jest.spyOn(s3bucket, 'upload')
    const spyRemoveFromS3 = jest.spyOn(s3bucket, 'deleteObject')

    beforeEach(() => jest.clearAllMocks())

    test('create Uploaded File', async () => {
        const testFile = {
            originalname: faker.datatype.string(),
            mimetype: randomMimetype,
            size: faker.datatype.number({ min: 0, max: 50000 }),
        }
        const sourceId = mockFile.sourceId

        const file = await createUploadedFile(testFile, sourceId)

        expect(spyFileCreate).toHaveBeenCalledTimes(1)
        expect(file.id).toBe(mockFile.id)
        expect(file.sourceId).toBe(sourceId)
        expect(file.mimetype).toBe(testFile.mimetype)
        expect(file.originalname).toBe(testFile.originalname)
    })

    test('create Uploaded Files With S3', async () => {
        const testFile = {
            path: 'test/unit/__mock__/mockUploadedFile',
            originalname: faker.datatype.string(),
            mimetype: randomMimetype,
            size: faker.datatype.number({ min: 0, max: 50000 }),
        }
        const sourceId = mockFile.sourceId
        const count = 5
        const files = getMockFileList(testFile, { sourceId }, count)

        await createUploadedFilesWithS3(files, sourceId)

        expect(spyFileCreate).toHaveBeenCalledTimes(count)
        expect(spyUploadToS3).toHaveBeenCalledTimes(count)
    })

    test('get File By Id With Source', async () => {
        const id = faker.datatype.uuid()
        const file = await getFileByIdWithSource(id)
        const courses = file.Lessons.every((el) => el.hasOwnProperty('Courses'))

        expect(spyFileFindOne).toHaveBeenCalledTimes(1)
        expect(file.id).toBe(id)
        expect(file.originalname).toBe(mockFile.originalname)
        expect(file.sourceId).toBe(mockFile.sourceId)
        expect(file.mimetype).toBe(mockFile.mimetype)
        expect(file.size).toBe(mockFile.size)
        expect(file.Homeworks).toBeDefined()
        expect(file.Lessons).toBeDefined()
        expect(courses).toBeDefined()
    })

    test('remove Files', async () => {
        const fileIds = Array.from({ length: 4 }, () => faker.datatype.uuid())
        const file = await removeFiles(fileIds)

        expect(spyFileDestroy).toHaveBeenCalledTimes(1)
        expect(file).toStrictEqual([1])
    })

    test('remove Files With S3', async () => {
        const count = 7
        const testFile = {
            path: 'test/unit/__mock__/mockUploadedFile',
            originalname: faker.datatype.string(),
            mimetype: randomMimetype,
            size: faker.datatype.number({ min: 0, max: 50000 }),
        }

        const files = getMockFileList(testFile, {}, count)
        const result = await removeFilesWithS3(files)

        expect(spyFileDestroy).toHaveBeenCalledTimes(1)
        expect(spyRemoveFromS3).toHaveBeenCalledTimes(count)
        expect(result).toBeTruthy()
    })
})
