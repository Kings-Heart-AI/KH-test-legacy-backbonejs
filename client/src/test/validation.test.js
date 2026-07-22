import { describe, it, expect } from 'vitest';
import { validateField, validateAll } from '../validation';

describe('client-side validation (mirrors server-side rules added in Phase 3)', () => {
    it('flags empty name/grapes/country', () => {
        const result = validateAll({ name: '', grapes: '', country: '' });
        expect(result.isValid).toBe(false);
        expect(result.messages.name).toMatch(/name/i);
        expect(result.messages.grapes).toMatch(/grape/i);
        expect(result.messages.country).toMatch(/country/i);
    });

    it('passes when all three required fields are non-empty', () => {
        const result = validateAll({ name: 'Foo', grapes: 'Merlot', country: 'France' });
        expect(result.isValid).toBe(true);
        expect(result.messages).toEqual({});
    });

    it('validateField checks a single field live', () => {
        expect(validateField('name', '').isValid).toBe(false);
        expect(validateField('name', 'Foo').isValid).toBe(true);
        expect(validateField('region', '').isValid).toBe(true); // region is not a required field
    });
});
