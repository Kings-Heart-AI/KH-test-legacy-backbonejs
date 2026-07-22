import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import WineListPage from './pages/WineListPage';
import AddWinePage from './pages/AddWinePage';
import WineDetailPage from './pages/WineDetailPage';
import AboutPage from './pages/AboutPage';

export default function App() {
    return (
        <div>
            <Header />
            <div className="container">
                <div id="content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/wines" element={<WineListPage />} />
                        <Route path="/wines/page/:page" element={<WineListPage />} />
                        <Route path="/wines/add" element={<AddWinePage />} />
                        <Route path="/wines/:id" element={<WineDetailPage />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </div>
                <footer className="footer">
                    <p>Built as a sample application with React, Node.js, Express, and MongoDB.</p>
                </footer>
            </div>
        </div>
    );
}
