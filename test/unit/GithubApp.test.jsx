import React from 'react';
import renderer from 'react-test-renderer';
import { DeskproSDK, testDpapp, testStore } from '@deskpro/apps-sdk-react';
import GithubApp from '../../main/javascript/GithubApp';

test('successfully render the application in initial state', () => {
  const component = renderer.create(
    <DeskproSDK dpapp={testDpapp} store={testStore}>
      <GithubApp />
    </DeskproSDK>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
