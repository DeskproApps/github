import React from 'react';
import renderer from 'react-test-renderer';
import { createAppFromProps } from '@deskpro/apps-sdk-core';
import { DeskproSDK, configureStore } from '@deskpro/apps-sdk-react';

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

export const dpapp = createAppFromProps({ contextProps, instanceProps });
dpapp.manifest = {
  storage: []
};

export const store = configureStore(dpapp);

export default function render(component, context) {
  return renderer.create(
    <DeskproSDK dpapp={dpapp} store={store}>
      <component />
    </DeskproSDK>,
    context
  );
}
