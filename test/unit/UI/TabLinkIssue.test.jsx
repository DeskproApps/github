import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import { createAppFromProps } from '@deskpro/apps-sdk';
import { createMemoryHistory as createHistory } from "history";
import TabLinkIssue from '../../../src/UI/TabLinkIssue';
import store from '../../../src/store';

test('successfully renders a link tab', () => {
  const repos = [
    {
      full_name: 'DeskproApps/github'
    },
    {
      full_name: 'DeskproApps/trello'
    }
  ];

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
      <TabLinkIssue
        repos=      {repos}
        onError=    {() => {}}
        onLinkIssue={() => {}}
        history=    {history}
        dpapp=      {dpapp}
      />
    </Provider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
