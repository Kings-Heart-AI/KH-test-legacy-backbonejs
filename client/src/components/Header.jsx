import { NavLink } from 'react-router-dom';

function navClass({ isActive }) {
    return isActive ? 'active' : '';
}

export default function Header() {
    return (
        <div className="navbar">
            <div className="navbar-inner">
                <a className="brand" href="/">Node Cellar</a>
                <ul className="nav">
                    <li><NavLink to="/wines" className={navClass}>Browse Wines</NavLink></li>
                    <li><NavLink to="/wines/add" className={navClass}>Add Wine</NavLink></li>
                </ul>
                <ul className="nav nav-right">
                    <li><NavLink to="/about" className={navClass}>About</NavLink></li>
                </ul>
            </div>
        </div>
    );
}
