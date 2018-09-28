import React from 'react';
import renderer from 'react-test-renderer';
import Issue from '../../../src/UI/Issue';

test('successfully renders an issue list item', done => {
  const issue = {
    number:    1,
    title:     'bug fix',
    state:     'open',
    milestone: '',
    assignee:  '',
    labels:    [],
    htmlUrl:  'https://github.com/deskpro/apps-dpat/pull/14',
    repositoryUrl: 'https://github.com/deskpro/apps-dpat'
  };

  const component = renderer.create(<Issue issue={issue} />);

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  done();
});
