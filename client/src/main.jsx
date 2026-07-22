import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// HashRouter (routes live under '#/...') keeps client-side routes out of the
// server's URL namespace, avoiding collisions with the REST API's
// '/wines' and '/wines/:id' paths (e.g. a browser-history '/wines/add' would
// otherwise be indistinguishable from a request for wine id "add").
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
