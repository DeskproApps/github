import React from 'react';
import render from '../render';
import TabLinkIssue from '../../../main/javascript/UI/TabLinkIssue';

test('successfully renders a link tab', () => {
  const repos = [
    {
      full_name: 'DeskproApps/github'
    },
    {
      full_name: 'DeskproApps/trello'
    }
  ];

  const component = render(
    <TabLinkIssue
      repos={repos}
      onError={() => {}}
      onLinkIssue={() => {}}
    />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
