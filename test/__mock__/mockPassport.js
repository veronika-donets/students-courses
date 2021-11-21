import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { USER_ROLES } from '../../src/helpers'
import passportJs from 'passport'

export function useMockPassport() {
    const options = {
        jwtFromRequest: ExtractJwt.fromHeader('jwt'),
        secretOrKey: process.env.AUTH_SECRET_KEY,
    }

    passportJs.use(
        USER_ROLES.ADMIN,
        new JwtStrategy(options, (jwt_payload, done) => {
            try {
                const { role } = jwt_payload.data

                if (role === USER_ROLES.ADMIN) {
                    return done(null, role)
                } else {
                    return done(null, false)
                }
            } catch (e) {
                return done(e, false)
            }
        })
    )

    passportJs.use(
        USER_ROLES.INSTRUCTOR,
        new JwtStrategy(options, (jwt_payload, done) => {
            try {
                const { role } = jwt_payload.data

                if (role === USER_ROLES.INSTRUCTOR) {
                    return done(null, role)
                } else {
                    return done(null, false)
                }
            } catch (e) {
                return done(e, false)
            }
        })
    )

    passportJs.use(
        USER_ROLES.STUDENT,
        new JwtStrategy(options, (jwt_payload, done) => {
            try {
                const { role } = jwt_payload.data

                if (role === USER_ROLES.STUDENT) {
                    return done(null, role)
                } else {
                    return done(null, false)
                }
            } catch (e) {
                return done(e, false)
            }
        })
    )

    passportJs.serializeUser(function (user, done) {
        done(null, user)
    })

    passportJs.deserializeUser(function (user, done) {
        done(null, user)
    })

    return passportJs
}
