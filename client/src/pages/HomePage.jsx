import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="home-hero">
            <h1>Welcome to Node Cellar</h1>
            <h3>A sample application built with React, Node.js, Express, and MongoDB</h3>
            <br />
            <div style={{ opacity: 0.9 }}>
                <Link className="btn btn-large" to="/wines">
                    <img src="/img/wine.png" className="pull-left" style={{ marginRight: 6 }} alt="" />
                    Start Browsing<br />Node Cellar
                </Link>
            </div>
        </div>
    );
}
