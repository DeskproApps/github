import * as forms from '../../../src/utils/forms';

test('reposToOptions successfully squashes repos', done => {
  const repos = [
    { full_name: 'DeskproApps/github' },
    { full_name: 'DeskproApps/trello' }
  ];
  const expected = [
    { label: 'DeskproApps/github', value: 'DeskproApps/github'},
    { label: 'DeskproApps/trello', value: 'DeskproApps/trello' }
  ];
  expect(forms.reposToOptions(repos)).toEqual(expected);

  done();
});

test('projectsToOptions successfully squashes projects', done => {
  const projects = [
    { id: 1, name: 'github' },
    { id: 2, name: 'trello' }
  ];
  const expected = [
    { label: 'github', value: 1 },
    { label: 'trello', value: 2 }
  ];
  expect(forms.projectsToOptions(projects)).toEqual(expected);

  done();
});

test('milestonesToOptions successfully squashes milestones', done => {
  const milestones = [
    { id: 1, title: 'milestone 1' },
    { id: 2, title: 'milestone 2' }
  ];
  const expected = [
    { label: 'milestone 1', value: 1 },
    { label: 'milestone 2', value: 2 }
  ];
  expect(forms.milestonesToOptions(milestones)).toEqual(expected);

  done();
});

test('contributorsToOptions successfully squashes contributors', done => {
  const contributors = [
    'headzoo',
    'chroder'
  ];
  const expected = [
    { label: 'headzoo', value: 'headzoo' },
    { label: 'chroder', value: 'chroder' }
  ];
  expect(forms.contributorsToOptions(contributors)).toEqual(expected);

  done();
});

test('issuesToOptions successfully squashes issues', done => {
  const issues = [
    { number: '500', title: 'bug fix' },
    { number: '501', title: 'feature request' }
  ];
  const expected = [
    { label: '#500 bug fix', value: '500' },
    { label: '#501 feature request', value: '501' }
  ];
  expect(forms.issuesToOptions(issues)).toEqual(expected);

  done();
});
