import { jest } from '@jest/globals'
import { downloadFromS3, removeFromS3, uploadToS3 } from '../../../src/services/aws-S3.service'
import faker from 'faker'
import { randomMimetype } from '../__mock__/mockResponseData'

describe('AWS S3 service testing', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('upload To S3', async () => {
        const testFile = {
            path: 'test/unit/__mock__/mockUploadedFile',
            originalname: faker.datatype.string(),
            mimetype: randomMimetype,
            size: faker.datatype.number({ min: 0, max: 50000 }),
        }
        const sourceId = faker.datatype.uuid()

        const result = await uploadToS3(testFile, sourceId)
        expect(result).toBe('success')
    })

    test('upload To S3 failed', async () => {
        const testFile = {
            path: 'test/unit/__mock__/mockUploadedFile',
            originalname: faker.datatype.string(),
            mimetype: randomMimetype,
            size: faker.datatype.number({ min: 0, max: 50000 }),
        }

        try {
            const result = await uploadToS3(testFile, '')

            expect(result).toBeFalsy()
        } catch (e) {
            expect(e).toBe('failed')
        }
    })

    test('download From S3', async () => {
        const sourceId = faker.datatype.uuid()
        const name = faker.commerce.product()

        const result = await downloadFromS3(name, sourceId)
        expect(result).toBe('success')
    })

    test('download From S3 failed', async () => {
        const name = faker.commerce.product()

        try {
            const result = await downloadFromS3(name, '')

            expect(result).toBeFalsy()
        } catch (e) {
            expect(e).toBe('failed')
        }
    })

    test('remove From S3', async () => {
        const sourceId = faker.datatype.uuid()
        const name = faker.commerce.product()

        const result = await removeFromS3(name, sourceId)
        expect(result).toBe('success')
    })

    test('remove From S3 failed', async () => {
        const name = faker.commerce.product()

        try {
            const result = await removeFromS3(name, '')

            expect(result).toBeFalsy()
        } catch (e) {
            expect(e).toBe('failed')
        }
    })
})
