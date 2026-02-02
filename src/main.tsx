import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/press-start-2p';
import './styles/global.css';
import './styles/scanlines.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
