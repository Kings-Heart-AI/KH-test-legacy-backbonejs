import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// The 5 routes ported from public/js/main.js's Backbone AppRouter.
describe('App routing (matches the 5 legacy AppRouter routes 1:1)', () => {
    beforeEach(() => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve([])
            })
        );
    });

    it('"" -> HomePage', () => {
        render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
        expect(screen.getByText(/Welcome to Node Cellar/i)).toBeInTheDocument();
    });

    it('"wines" -> WineListPage', async () => {
        const { container } = render(<MemoryRouter initialEntries={['/wines']}><App /></MemoryRouter>);
        await waitFor(() => expect(container.querySelector('ul.thumbnails')).toBeInTheDocument());
    });

    it('"wines/page/:page" -> WineListPage', async () => {
        const { container } = render(<MemoryRouter initialEntries={['/wines/page/2']}><App /></MemoryRouter>);
        await waitFor(() => expect(container.querySelector('ul.thumbnails')).toBeInTheDocument());
    });

    it('"wines/add" -> AddWinePage', () => {
        render(<MemoryRouter initialEntries={['/wines/add']}><App /></MemoryRouter>);
        expect(screen.getByText(/Wine Details/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name:/i)).toHaveValue('');
    });

    it('"wines/:id" -> WineDetailPage', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve({ _id: 'abc123', name: 'Test Wine', grapes: 'Merlot', country: 'France' })
            })
        );
        render(<MemoryRouter initialEntries={['/wines/abc123']}><App /></MemoryRouter>);
        await waitFor(() => expect(screen.getByLabelText(/Name:/i)).toHaveValue('Test Wine'));
    });

    it('"about" -> AboutPage', () => {
        render(<MemoryRouter initialEntries={['/about']}><App /></MemoryRouter>);
        expect(screen.getByText(/Download the source code/i)).toBeInTheDocument();
    });
});
