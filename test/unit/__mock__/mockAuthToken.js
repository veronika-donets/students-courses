import jwt from 'jsonwebtoken'
import faker from 'faker'

export const generateMockToken = async (user) => {
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
