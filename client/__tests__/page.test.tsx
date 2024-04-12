/* eslint-disable testing-library/prefer-screen-queries */
import { render } from '@testing-library/react'
import React from 'react'
import LoginPage from '../app/login/page'
import '@testing-library/jest-dom'

describe('Page', () => {
    it('Render starts with load', () => {
        const { getByText } = render(<LoginPage />)
        const specificText = getByText('About Stagnum')
        expect(specificText).toBeInTheDocument()
    })
})
