import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { USER_ROLES } from '../helpers'
import passport from 'passport'
import { getUserById } from '../models/user'

const options = Object.freeze({
    jwtFromRequest: ExtractJwt.fromHeader('jwt'),
    secretOrKey: process.env.AUTH_SECRET_KEY,
})

passport.use(
    USER_ROLES.ADMIN,
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const { id } = jwt_payload.data
            const user = await getUserById(id)

            if (user && user.role === USER_ROLES.ADMIN) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch (e) {
            return done(e, false)
        }
    })
)

passport.use(
    USER_ROLES.INSTRUCTOR,
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const { id } = jwt_payload.data
            const user = await getUserById(id)

            if (user && user.role === USER_ROLES.INSTRUCTOR) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch (e) {
            return done(e, false)
        }
    })
)

passport.use(
    USER_ROLES.STUDENT,
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const { id } = jwt_payload.data
            const user = await getUserById(id)

            if (user && user.role === USER_ROLES.INSTRUCTOR) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch (e) {
            return done(e, false)
        }
    })
)

passport.serializeUser(function (user, done) {
    const sessionUser = {
        id: user.id,
        email: user.email,
    }

    done(null, sessionUser)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
})

export default passport
