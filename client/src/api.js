// Thin fetch wrapper around the /wines REST API (Phase 3's cleaned-up contract:
// proper status codes, JSON error bodies of the shape {error, messages?}).

async function request(url, options) {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : null;
    if (!res.ok) {
        const error = new Error((body && body.error) || 'Request failed with status ' + res.status);
        error.status = res.status;
        error.messages = body && body.messages;
        throw error;
    }
    return body;
}

export function getWines() {
    return request('/wines');
}

export function getWine(id) {
    return request('/wines/' + id);
}

export function createWine(wine) {
    return request('/wines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wine)
    });
}

export function updateWine(id, wine) {
    return request('/wines/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wine)
    });
}

export function deleteWine(id) {
    return request('/wines/' + id, { method: 'DELETE' });
}
