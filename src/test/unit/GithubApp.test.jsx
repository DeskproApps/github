import React from 'react';
import { createAppFromProps } from '@deskpro/apps-sdk-core';
import renderer from 'react-test-renderer';

import GithubApp from '../../main/javascript/GithubApp';

test('successfully render the application in initial state', done => {
  const contextProps = {
    type:       'ticket',
    entityId:   '1',
    locationId: 'ticket-sidebar',
    tabId:      'tab-id',
    tabUrl:     'http://127.0.0.1'
  };

  const instanceProps = {
    appId:          '1',
    instanceId:     '1',
    appTitle:       'GitHub',
    appPackageName: 'app-boilerplate-react'
  };

  const dpapp = createAppFromProps({ contextProps, instanceProps });
  const component = renderer.create(
    <GithubApp
      storage={dpapp.storage}
      context={dpapp.context}
    />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  done();
});
