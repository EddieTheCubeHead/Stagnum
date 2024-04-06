import { faker } from '@faker-js/faker'

interface UserData {
    id: string
    name: string
    email: string
    sex: string
    // Add more fields as needed
}

export const generateMockUserData = (count: number): UserData[] => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        sex: faker.person.sexType(),
        // Add more fields as needed
    }))
}

/**
 * @fileOverview MockData.js - Mock Data Generation using faker.js
 * @module MockData
 * @description
 * This module provides a function to generate mock user data using faker.js.
 *  *
 * @function
 * @name generateMockUserData
 * @param {number} count - The number of mock users to generate.
 * @returns {Array<Object>} An array of mock user objects.
 * @throws Will throw an error if faker.js encounters an issue.
 *
 * To use faker.js you need to just import this file and call this method with a number.
 * It will return an array with that amount of users and informations in it.
 * To use other mock data you can see the documentation of faker.js given below and just add more fields to the object. See example below.
 * @see {@link https://fakerjs.dev/guide/usage.html faker.js Documentation}
 *
 * @example
 * // Import the MockData module
 * import { generateMockUserData } from '../app/utils/MockData';
 *
 * // Generate mock user data with 5 users
 * const mockUsers = generateMockUserData(5);
 * console.log(mockUsers); or implement it however you want
 *
 * @output
 * // [
 * //   { id: '...', name: 'John Doe', email: 'john.doe@example.com' },
 * //   { id: '...', name: 'Jane Smith', email: 'jane.smith@example.com' },
 * //   ...
 * // ]
 *
 */
