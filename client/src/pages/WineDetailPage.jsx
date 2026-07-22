import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WineForm from '../components/WineForm';
import { getWine, updateWine, deleteWine } from '../api';

export default function WineDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [wine, setWine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getWine(id)
            .then((data) => {
                if (!cancelled) {
                    setWine(data);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.status === 404 ? 'Wine not found' : err.message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, [id]);

    async function handleSave(form) {
        try {
            const saved = await updateWine(id, form);
            setWine(saved);
            setStatusMessage({ type: 'success', text: 'Wine saved successfully' });
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        }
    }

    async function handleDelete() {
        try {
            await deleteWine(id);
            navigate('/wines');
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    return <WineForm wine={wine} onSave={handleSave} onDelete={handleDelete} statusMessage={statusMessage} />;
}
