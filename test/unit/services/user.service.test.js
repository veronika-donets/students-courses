import { jest } from '@jest/globals'
import { getUserByEmail, getUserByEmailWithRelations } from '../../../src/services/user.service'
import { mockUserFindOne } from '../__mock__/mockApp'

describe('User service testing', () => {
    beforeEach(() => jest.resetAllMocks())

    test('Get user by id works as expected', async () => {
        await getUserByEmail()
        expect(mockUserFindOne).toHaveBeenCalledTimes(1)
    })

    test('get User By Email With Relations works as expected', async () => {
        await getUserByEmailWithRelations()
        expect(mockUserFindOne).toHaveBeenCalledTimes(1)
    })

    test('get User By Email With Relations works as expected', async () => {
        await getUserByEmailWithRelations()
        expect(mockUserFindOne).toHaveBeenCalledTimes(1)
    })
})
