import faker from 'faker'
import { hashPassword } from '../../../src/helpers'

const mockUserPassword = faker.internet.password()
const hashedPassword = hashPassword(mockUserPassword)

export const mockUser = {
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    decryptedPassword: mockUserPassword,
    isEmailVerified: faker.datatype.boolean(),
    role: faker.name.jobType(),
    agreeTOS: faker.datatype.boolean(),
}

export const mockUserModel = (User) => {
    User.findOne = ({ where }) => {
        return new Promise((resolve) => resolve({ ...mockUser, ...where }))
    }
    User.create = (params) => {
        return new Promise((resolve) => resolve({ ...mockUser, ...params }))
    }
    User.update = (params) => {
        if (params.password) {
            const password = hashPassword(params.password)

            return new Promise((resolve) =>
                resolve({
                    ...mockUser,
                    ...params,
                    password,
                    decryptedPassword: params.password,
                })
            )
        }
        return new Promise((resolve) => resolve({ ...mockUser, ...params }))
    }
    User.destroy = () => {}
}
