import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import App from '../../src/GithubApp';
import store from "../../src/store";
import {createAppFromProps} from "@deskpro/apps-sdk/";
import { createMemoryHistory as createHistory } from "history";

test('successfully render the application in initial state', () => {

  const history = createHistory({
    initialEntries: ["loading"],
    initialIndex: 0
  });

  const dpapp = createAppFromProps({
    instanceProps: {
      appId:          '1',
      appTitle:       'title',
      appPackageName: 'com.deskpro.app',
      instanceId:     '1',
    },
    contextProps: {
      type: 'ticket',
      entityId: '1',
      locationId: '1',
      tabId: 'tab-1',
      tabUrl: 'https://127.0.0.1',
    }
  });

  const component = renderer.create(
    <Provider store={store}>
      <App dpapp={dpapp} history={history} />
    </Provider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
