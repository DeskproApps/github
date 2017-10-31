import React from 'react';
import renderer from 'react-test-renderer';

import TabLinkIssue from '../../../main/javascript/UI/TabLinkIssue';

test('successfully renders an issue list item', done => {
  const repos = [
    {
      full_name: 'DeskproApps/github'
    },
    {
      full_name: 'DeskproApps/trello'
    }
  ];

  const component = renderer.create(
    <TabLinkIssue
      repos={repos}
      onError={() => {}}
      onLinkIssue={() => {}}
    />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  done();
});
