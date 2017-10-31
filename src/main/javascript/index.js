import ReactDOM from 'react-dom';
import { DeskproSDK, configureStore } from '@deskpro/apps-sdk-react';
import GithubApp from './GithubApp';

export function runApp(app) {
  const store = configureStore(app);

  ReactDOM.render(
    <DeskproSDK dpapp={app} store={store}>
      <GithubApp />
    </DeskproSDK>,
    document.getElementById('deskpro-app')
  );
}
