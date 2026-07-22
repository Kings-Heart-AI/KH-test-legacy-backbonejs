// Mirrors the server-side validation rules added in Phase 3 (routes/wines.js)
// and the client-side rules that used to live in public/js/models/models.js.

export const validators = {
    name: (value) => (value && value.length > 0 ? { isValid: true } : { isValid: false, message: 'You must enter a name' }),
    grapes: (value) => (value && value.length > 0 ? { isValid: true } : { isValid: false, message: 'You must enter a grape variety' }),
    country: (value) => (value && value.length > 0 ? { isValid: true } : { isValid: false, message: 'You must enter a country' })
};

export function validateField(field, value) {
    return validators[field] ? validators[field](value) : { isValid: true };
}

export function validateAll(wine) {
    const messages = {};
    Object.keys(validators).forEach((field) => {
        const check = validators[field](wine[field]);
        if (!check.isValid) {
            messages[field] = check.message;
        }
    });
    return { isValid: Object.keys(messages).length === 0, messages };
}
