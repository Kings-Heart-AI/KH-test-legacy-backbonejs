import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Paginator, { pageCount, PAGE_SIZE } from '../components/Paginator';

describe('pagination (8 items/page, matches legacy paginator.js)', () => {
    it('PAGE_SIZE is 8', () => {
        expect(PAGE_SIZE).toBe(8);
    });

    it('pageCount matches Math.ceil(len / 8)', () => {
        expect(pageCount(0)).toBe(0);
        expect(pageCount(8)).toBe(1);
        expect(pageCount(9)).toBe(2);
        expect(pageCount(24)).toBe(3);
    });

    it('renders no pagination when there is only one page', () => {
        const { container } = render(
            <MemoryRouter><Paginator totalItems={5} page={1} /></MemoryRouter>
        );
        expect(container.querySelector('ul')).toBeNull();
    });

    it('renders a page link per page and marks the active one', () => {
        render(<MemoryRouter><Paginator totalItems={24} page={2} /></MemoryRouter>);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
        expect(links[1].closest('li')).toHaveClass('active');
        expect(links[1]).toHaveAttribute('href', '/wines/page/2');
    });
});
