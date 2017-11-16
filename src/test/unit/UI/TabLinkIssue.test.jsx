import React from 'react';
import renderer from 'react-test-renderer';
import { DeskproSDK, testDpapp, testStore } from '@deskpro/apps-sdk-react';
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

  const component = renderer.create(
    <DeskproSDK dpapp={testDpapp} store={testStore} ready>
      <TabLinkIssue
        repos={repos}
        onError={() => {}}
        onLinkIssue={() => {}}
      />
    </DeskproSDK>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
