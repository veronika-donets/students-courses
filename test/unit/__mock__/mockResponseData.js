import faker from 'faker'
import { hashPassword, USER_ROLES, VALIDATIONS } from '../../../src/helpers'

export const mockUserId = faker.datatype.uuid()
export const mockStudentId = faker.datatype.uuid()
export const mockInstructorId = faker.datatype.uuid()
export const mockAdminId = faker.datatype.uuid()
export const mockCourseId = faker.datatype.uuid()
export const mockCourseIdWithoutInstructor = faker.datatype.uuid()
export const mockLessonId = faker.datatype.uuid()
export const mockHomeworkId = faker.datatype.uuid()
export const mockResultId = faker.datatype.uuid()
export const mockFileId = faker.datatype.uuid()
export const mockFileBuffer = Buffer.from('a'.repeat(10000))
export const mockInstructorEmail = faker.internet.email()

export const randomLength = faker.datatype.number({ min: 1, max: 10 })
export const randomMark = faker.datatype.number({ min: 1, max: 100 })
export const randomComment = faker.lorem.sentences(randomLength)
export const randomMimetype = faker.random.arrayElement([...VALIDATIONS.FILE_TYPE])
export const randomFeedback = faker.lorem.sentences(randomLength)
export const idInstructorList = [mockInstructorId, faker.datatype.uuid()]
export const mockUserPassword = faker.internet.password()
export const hashedPassword = hashPassword(mockUserPassword)

export const mockUser = {
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    decryptedPassword: mockUserPassword,
    isEmailVerified: false,
    role: USER_ROLES.STUDENT,
    agreeTOS: faker.datatype.boolean(),
}

export const mockHomework = {
    id: mockHomeworkId,
    lessonId: mockLessonId,
    studentId: mockUserId,
    mark: randomMark,
    comment: randomComment,
}

export const mockLesson = {
    id: mockLessonId,
    courseId: mockCourseId,
    title: faker.lorem.sentences(1),
    description: faker.lorem.sentences(3),
}

export const mockResult = {
    id: mockResultId,
    courseId: faker.datatype.uuid(),
    studentId: faker.datatype.uuid(),
    isCoursePassed: faker.datatype.boolean(),
    finalMark: randomMark,
    feedback: randomFeedback,
}

export const mockFile = {
    id: mockFileId,
    originalname: faker.datatype.string(),
    sourceId: faker.datatype.uuid(),
    mimetype: randomMimetype,
    size: faker.datatype.number({ min: 0, max: 50000 }),
}

export const mockCourse = {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentences(1),
    description: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
    instructorIds: idInstructorList,
}
