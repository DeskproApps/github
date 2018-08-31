import { AppFrame } from '@deskpro/apps-components';
import { createApp } from '@deskpro/apps-sdk';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from "react-redux";

import './styles.css';
import App from './GithubApp';
import store from './store';

createApp(dpapp => props => {
  ReactDOM.render(
    <AppFrame {...props}>
      <Provider store={store}>
        <App dpapp={dpapp} />
      </Provider>
    </AppFrame>,
    document.getElementById('root')
  )
});
