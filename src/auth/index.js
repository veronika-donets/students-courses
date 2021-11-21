import { ENVIRONMENT } from '../helpers'
import { useMockPassport } from '../../test/unit/__mock__/mockPassport'
import { useAppPassport } from './passport'

const passport =
    process.env.NODE_ENV === ENVIRONMENT.TEST
        ? useMockPassport()
        : useAppPassport()

export default passport