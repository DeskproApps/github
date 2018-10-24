import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import PageCreateIssue from '../../../src/UI/PageCreateIssue';
import { createAppFromProps } from '@deskpro/apps-sdk';
import { createMemoryHistory as createHistory } from "history";
import store from '../../../src/store';

global.getComputedStyle = () => {
  return {
    width: 0
  };
};

// https://github.com/facebook/react/issues/7740#issuecomment-247335106
function createNodeMock() {
  return {
    style:            {},
    addEventListener: () => {}
  };
}

// https://github.com/YouCanBookMe/react-datetime/issues/384#issuecomment-318888730
jest.mock('react-dom', () => ({
  findDOMNode: () => {}
}));

test('successfully renders the create tab', () => {
  const repos = [
    {
      full_name: 'DeskproApps/github'
    },
    {
      full_name: 'DeskproApps/trello'
    }
  ];

  global.addEventListener = () => true;

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
      <PageCreateIssue
        repos=          {repos}
        onError=        {() => {}}
        onCreateIssue=  {() => {}}
        history=        {history}
        dpapp=          {dpapp}
      />
    </Provider>, { createNodeMock }
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
