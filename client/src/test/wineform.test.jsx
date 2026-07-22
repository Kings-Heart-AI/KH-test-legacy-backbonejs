import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WineForm from '../components/WineForm';

describe('WineForm (change-tracking, live validation, drag-drop preview)', () => {
    it('shows a live validation error and does not call onSave when a required field is empty', () => {
        const onSave = vi.fn();
        render(<WineForm wine={{ name: '', grapes: 'Merlot', country: 'France' }} onSave={onSave} />);

        fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form'));

        expect(screen.getByText(/You must enter a name/i)).toBeInTheDocument();
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with the current form state when all required fields are valid', () => {
        const onSave = vi.fn();
        render(<WineForm wine={{ name: '', grapes: '', country: '' }} onSave={onSave} />);

        fireEvent.change(screen.getByLabelText(/Name:/i), { target: { name: 'name', value: 'Foo' } });
        fireEvent.change(screen.getByLabelText(/Grapes:/i), { target: { name: 'grapes', value: 'Merlot' } });
        fireEvent.change(screen.getByLabelText(/Country:/i), { target: { name: 'country', value: 'France' } });

        fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form'));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave.mock.calls[0][0]).toMatchObject({ name: 'Foo', grapes: 'Merlot', country: 'France' });
    });

    it('updates the picture preview via FileReader on drop', async () => {
        render(<WineForm wine={{ name: 'Foo', grapes: 'Merlot', country: 'France' }} onSave={vi.fn()} />);

        const file = new File(['fake-image-bytes'], 'bottle.png', { type: 'image/png' });
        const img = screen.getByAltText('Wine');

        fireEvent.drop(img, { dataTransfer: { files: [file], dropEffect: '' } });

        await waitFor(() => expect(img.getAttribute('src')).toMatch(/^data:/));
    });
});
