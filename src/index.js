import { AppFrame } from '@deskpro/apps-components';
import { createApp } from '@deskpro/apps-sdk';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from "react-redux";
import { createMemoryHistory as createHistory } from "history";

import './styles.css';
import App from './GithubApp';
import { AppPlaceholder } from './UI';
import store from './store';

const history = createHistory({
  initialEntries: ["loading"],
  initialIndex: 0
});

createApp(dpapp => props => {
  ReactDOM.render(
    <AppFrame {...props}>
      <Provider store={store}>
        {dpapp.getProperty('isPreRender') ? <AppPlaceholder /> : <App dpapp={dpapp} history={history}/>}
      </Provider>
    </AppFrame>,
    document.getElementById('root')
  )
});
