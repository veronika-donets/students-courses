import faker from 'faker'

export const randomMark = faker.random.arrayElement([
    faker.datatype.number({ max: 100, min: 0 }),
    null,
])
export const randomFeedback = faker.random.arrayElement([
    faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
    null,
])

export const mockResult = {
    id: faker.datatype.uuid(),
    courseId: faker.datatype.uuid(),
    studentId: faker.datatype.uuid(),
    isCoursePassed: faker.datatype.boolean(),
    finalMark: randomMark,
    feedback: randomFeedback,
}

export const getMockResultList = (mockResult, where) => {
    const result = { ...mockResult, ...where }
    return Array.from({ length: 3 }, () => ({ ...result }))
}

export const mockResultModel = (Result) => {
    Result.findOne = ({ where }) => {
        return new Promise((resolve) => resolve({ ...mockResult, ...where }))
    }
    Result.findAll = ({ where }) => {
        return new Promise((resolve) => resolve(getMockResultList(mockResult, where)))
    }
    Result.create = (params) => {
        return new Promise((resolve) =>
            resolve({
                id: mockResult.id,
                isCoursePassed: false,
                finalMark: null,
                feedback: null,
                ...params,
            })
        )
    }
    Result.update = (params) => {
        return new Promise((resolve) => resolve({ ...mockResult, ...params }))
    }
    Result.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
