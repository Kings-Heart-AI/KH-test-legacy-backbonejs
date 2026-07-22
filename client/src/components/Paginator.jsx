import { Link } from 'react-router-dom';

const PAGE_SIZE = 8;

export function pageCount(totalItems) {
    return Math.ceil(totalItems / PAGE_SIZE);
}

export default function Paginator({ totalItems, page }) {
    const count = pageCount(totalItems);
    if (count <= 1) {
        return null;
    }
    const pages = Array.from({ length: count }, (_, i) => i + 1);
    return (
        <ul className="pagination pagination-centered">
            {pages.map((p) => (
                <li key={p} className={p === page ? 'active' : ''}>
                    <Link to={'/wines/page/' + p}>{p}</Link>
                </li>
            ))}
        </ul>
    );
}

export { PAGE_SIZE };
