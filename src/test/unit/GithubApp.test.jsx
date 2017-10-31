import React from 'react';
import render from './render';
import GithubApp from '../../main/javascript/GithubApp';

test('successfully render the application in initial state', () => {
  const component = render(
    <GithubApp />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
