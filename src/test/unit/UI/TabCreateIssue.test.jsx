import React from 'react';
import renderer from 'react-test-renderer';

import TabCreateIssue from '../../../main/javascript/UI/TabCreateIssue';

// https://github.com/facebook/react/issues/7740#issuecomment-247335106
function createNodeMock() {
  return {
    addEventListener: () => {}
  };
}

test('successfully renders an issue list item', done => {
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
    <TabCreateIssue
      repos={repos}
      onError={() => {}}
      onCreateIssue={() => {}}
    />, { createNodeMock }
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  done();
});
