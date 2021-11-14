import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { USER_ROLES } from '../../../src/helpers'

export default function useMockPassport(passport) {
    const options = {
        jwtFromRequest: ExtractJwt.fromHeader('jwt'),
        secretOrKey: process.env.AUTH_SECRET_KEY,
    }

    passport.use(
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

    passport.use(
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

    passport.use(
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

    passport.serializeUser(function (user, done) {
        done(null, user)
    })

    passport.deserializeUser(function (user, done) {
        done(null, user)
    })

    return passport
}
