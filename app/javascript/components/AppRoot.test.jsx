import { render, screen } from '@testing-library/react';
import React from 'react';
import AppRoot from './AppRoot.tsx';

describe('App tests', () => {
    it('should contains the heading 1', () => {
    render(<AppRoot />);
        const heading = screen.getByText(/Plan a Trip/i);
        expect(heading).toBeInTheDocument()
    });
});
