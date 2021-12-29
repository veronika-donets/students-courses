import jwt from 'jsonwebtoken'
import { mockUserId } from './mockResponseData'
import faker from 'faker'

export const generateMockToken = async (user, userId = mockUserId) => {
    const usr = {
        ...user,
        id: userId,
    }
    return jwt.sign(
        { data: usr },
        process.env.AUTH_SECRET_KEY,
        { expiresIn: 604800 } // 1 week
    )
}

export const generateMockTokenRandomId = async (user) => {
    const usr = {
        ...user,
        id: faker.datatype.uuid(),
    }
    return jwt.sign(
        { data: usr },
        process.env.AUTH_SECRET_KEY,
        { expiresIn: 604800 } // 1 week
    )
}
