import { mockResult } from './mockResponseData'

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
