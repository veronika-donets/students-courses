import { hashPassword, USER_ROLES } from '../../../src/helpers'
import { mockAdminId, mockInstructorId, mockStudentId, mockUser } from './mockResponseData'

export const mockUserModel = (User) => {
    User.findOne = ({ where }) => {
        if (where.id && where.id === mockStudentId) {
            return new Promise((resolve) =>
                resolve({ ...mockUser, role: USER_ROLES.STUDENT, ...where })
            )
        }
        if (where.id && where.id === mockInstructorId) {
            return new Promise((resolve) =>
                resolve({ ...mockUser, role: USER_ROLES.INSTRUCTOR, ...where })
            )
        }
        if (where.id && where.id === mockAdminId) {
            return new Promise((resolve) =>
                resolve({ ...mockUser, role: USER_ROLES.ADMIN, ...where })
            )
        }
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
