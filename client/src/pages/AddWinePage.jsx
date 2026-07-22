import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WineForm from '../components/WineForm';
import { createWine } from '../api';

export default function AddWinePage() {
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState(null);

    async function handleSave(wine) {
        try {
            const created = await createWine(wine);
            navigate('/wines/' + created._id);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        }
    }

    return <WineForm wine={{}} onSave={handleSave} statusMessage={statusMessage} />;
}
