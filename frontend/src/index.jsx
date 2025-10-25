import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './theme';
import { GlobalProvider } from './contexts/GlobalContext';
import { ReduxContext } from './contexts/ReduxContext';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import App from './App.jsx';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './index.css';
import './style.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <GlobalProvider>
          <ReduxContext>
            <WalletProvider>
              <ContractProvider>
                <App />
              </ContractProvider>
            </WalletProvider>
          </ReduxContext>
        </GlobalProvider>    
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
