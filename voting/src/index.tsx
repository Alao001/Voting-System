import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Voting } from './contracts/voting';
import artifact from '../artifacts/voting.json'
import { Scrypt, bsv } from 'scrypt-ts';

Voting.loadArtifact(artifact)

Scrypt.init({
  apiKey:process.env
  .REACT_APP_API_KEY || '',
  network :bsv.Networks.testnet
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
