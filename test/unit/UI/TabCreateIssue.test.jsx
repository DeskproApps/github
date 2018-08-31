import React from 'react';
import renderer from 'react-test-renderer';
import { DeskproSDK, testDpapp, testStore } from '@deskpro/apps-sdk-react';
import TabCreateIssue from '../../../main/javascript/UI/TabCreateIssue';

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

  const component = renderer.create(
    <DeskproSDK dpapp={testDpapp} store={testStore}>
      <TabCreateIssue
        repos={repos}
        onError={() => {}}
        onCreateIssue={() => {}}
      />
    </DeskproSDK>, { createNodeMock }
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
