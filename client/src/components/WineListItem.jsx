import { Link } from 'react-router-dom';

export default function WineListItem({ wine }) {
    const picture = wine.picture ? '/pics/' + wine.picture : '/pics/generic.jpg';
    return (
        <li>
            <Link to={'/wines/' + wine._id} className="thumbnail plain">
                <img src={picture} height="150" width="125" alt={wine.name} />
                <h5>{wine.name}</h5>
                <div>{wine.year} {wine.grapes}</div>
                <div>{wine.region}, {wine.country}</div>
            </Link>
        </li>
    );
}
