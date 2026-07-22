import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWines } from '../api';
import WineListItem from '../components/WineListItem';
import Paginator, { PAGE_SIZE } from '../components/Paginator';

export default function WineListPage() {
    const { page } = useParams();
    const currentPage = page ? parseInt(page, 10) : 1;

    const [wines, setWines] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getWines()
            .then((data) => {
                if (!cancelled) {
                    setWines(data);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, wines.length);
    const pageItems = wines.slice(start, end);

    return (
        <div>
            <ul className="thumbnails">
                {pageItems.map((wine) => (
                    <WineListItem key={wine._id} wine={wine} />
                ))}
            </ul>
            <Paginator totalItems={wines.length} page={currentPage} />
        </div>
    );
}
