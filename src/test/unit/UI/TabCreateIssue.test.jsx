import React from 'react';
import render from '../render';
import TabCreateIssue from '../../../main/javascript/UI/TabCreateIssue';

// https://github.com/facebook/react/issues/7740#issuecomment-247335106
function createNodeMock() {
  return {
    addEventListener: () => {}
  };
}

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

  const component = render(
    <TabCreateIssue
      repos={repos}
      onError={() => {}}
      onCreateIssue={() => {}}
    />, { createNodeMock }
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
