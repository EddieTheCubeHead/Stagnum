/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react'
import { render } from '@testing-library/react'
import NotAboutPage from '@/app/about/page'
import '@testing-library/jest-dom'

describe('NotAboutPage', () => {
    it('renders correctly', () => {
        const { getByText } = render(<NotAboutPage />)
        const specificText = getByText('This is not about page')
        expect(specificText).toBeInTheDocument()
    })

    // Add more test cases as needed
})
