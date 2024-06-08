import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import authConfig from './auth_config.json';
import 'bootstrap/dist/css/bootstrap.min.css';


const { domain, clientId, redirectUri } = authConfig;

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    redirectUri={redirectUri}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);

