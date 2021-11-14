import { jest } from '@jest/globals'
import {
    generateAuthToken,
    getUserByCredentials,
    getUserByEmail,
    getUserByEmailWithRelations,
    getUserById,
    getUserIdFromToken,
    createUser,
    updatePassword,
    updateIsEmailVerified,
    updateUserRole,
} from '../../../src/services/user.service'
import { User } from '../../../index'
import faker from 'faker'
import { USER_ROLES } from '../../../src/helpers'
import { mockUser } from '../__mock__/mockResponseData'

describe('User service testing', () => {
    const spyUserCreate = jest.spyOn(User, 'create')
    const spyUserFindOne = jest.spyOn(User, 'findOne')
    const spyUserUpdate = jest.spyOn(User, 'update')

    beforeEach(() => jest.clearAllMocks())

    test('Get User By Email works as expected', async () => {
        const email = faker.internet.email()
        const user = await getUserByEmail(email)

        expect(spyUserFindOne).toHaveBeenCalledTimes(1)
        expect(user.email).toBe(email.toLowerCase())
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('get User By Email With Relations works as expected', async () => {
        const email = faker.internet.email()
        const user = await getUserByEmailWithRelations(email)

        expect(spyUserFindOne).toHaveBeenCalledTimes(1)
        expect(user.email).toBe(email.toLowerCase())
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('get User By Id', async () => {
        const id = faker.datatype.uuid()
        const user = await getUserById(id)

        expect(spyUserFindOne).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(id)
        expect(user.email).toBe(mockUser.email)
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('get User By Credentials', async () => {
        const email = faker.internet.email()
        const password = mockUser.decryptedPassword
        const user = await getUserByCredentials(email, password)

        expect(spyUserFindOne).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(mockUser.id)
        expect(user.email).toBe(email.toLowerCase())
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('generate Auth Token', async () => {
        const token = await generateAuthToken(mockUser)

        expect(token).toBeTruthy()
        expect(typeof token).toBe('string')
    })

    test('get User Id From Token', async () => {
        const token = await generateAuthToken(mockUser)
        const id = await getUserIdFromToken(token)

        expect(id).toBe(mockUser.id)
    })

    test('create User', async () => {
        const testUser = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: mockUser.decryptedPassword,
            agreeTOS: faker.datatype.boolean(),
        }
        const user = await createUser(testUser)

        expect(spyUserCreate).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(mockUser.id)
        expect(user.email).toBe(testUser.email)
        expect(user.firstName).toBe(testUser.firstName)
        expect(user.lastName).toBe(testUser.lastName)
        expect(user.agreeTOS).toBe(testUser.agreeTOS)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('update User password', async () => {
        const id = mockUser.id
        const password = faker.internet.password()
        const user = await updatePassword(id, password)

        expect(spyUserUpdate).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(mockUser.id)
        expect(user.email).toBe(mockUser.email)
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.agreeTOS).toBe(mockUser.agreeTOS)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('update Is Email Verified', async () => {
        const id = faker.datatype.uuid()
        const isEmailVerified = faker.datatype.boolean()
        const user = await updateIsEmailVerified(id, isEmailVerified)

        expect(spyUserUpdate).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(mockUser.id)
        expect(user.email).toBe(mockUser.email)
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.agreeTOS).toBe(mockUser.agreeTOS)
        expect(user.isEmailVerified).toBe(isEmailVerified)
        expect(user.role).toBe(mockUser.role)
    })

    test('update User Role', async () => {
        const id = mockUser.id
        const role = faker.random.arrayElement(Object.values(USER_ROLES)).toLowerCase()
        const user = await updateUserRole(id, role)

        expect(spyUserUpdate).toHaveBeenCalledTimes(1)
        expect(user.id).toBe(id)
        expect(user.email).toBe(mockUser.email)
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.agreeTOS).toBe(mockUser.agreeTOS)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(role.toUpperCase())
    })

    test("update User Role returns null if a role doesn't exist", async () => {
        const id = mockUser.id
        const role = faker.name.jobType()
        const user = await updateUserRole(id, role)

        expect(spyUserUpdate).toHaveBeenCalledTimes(0)
        expect(user).toBeNull()
    })
})
