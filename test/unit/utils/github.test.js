import * as github  from '../../../src/utils/github';

test('splitRepoFullName successfully splits a repo full name', done => {
  [
    [
      'DeskproApps/github',
      { userName: 'DeskproApps', repoName: 'github' }
    ],
    [
      'deskpro/deskpro',
      { userName: 'deskpro', repoName: 'deskpro' }
    ]
  ].forEach((data) => {
    expect(github.splitRepoFullName(data[0])).toEqual(data[1]);
  });

  done();
});

test('splitRepoFullName throws Error on invalid repo full name', done => {
  expect(() => {
    github.splitRepoFullName('deskpro');
  }).toThrow();

  done();
});
